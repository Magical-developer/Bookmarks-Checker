import axios from "axios";
import { ActionType, dfs } from "@src/utils";
import async from "async";

export const checkDuplicate = async (
  bookmarks: chrome.bookmarks.BookmarkTreeNode[],
  selectedFolders: chrome.bookmarks.BookmarkTreeNode[],
  useDomainForDuplicationCheck: boolean,
  setResults: React.Dispatch<
    React.SetStateAction<
      Map<string, chrome.bookmarks.BookmarkTreeNode[] | undefined>
    >
  >,
  changeAction: (action: ActionType) => void
) => {
  if (bookmarks.length === 0) return;
  changeAction(ActionType.CHECK_DUPLICATE);
  const duplicates: Map<string, chrome.bookmarks.BookmarkTreeNode[]> =
    new Map();

  const normalizeUrl = (url: string) => {
    return url.replace(/\/$/, "").toLowerCase(); // 标准化 URL
  };

  const handleLeafNode = (node: chrome.bookmarks.BookmarkTreeNode) => {
    if (!node.url) return;
    const key = useDomainForDuplicationCheck
      ? new URL(node.url).hostname
      : normalizeUrl(node.url); // 使用标准化的 URL

    console.log("Processing node:", node.title, "with key:", key);

    if (duplicates.has(key)) {
      duplicates.get(key)?.push(node); // 直接存储节点
    } else {
      duplicates.set(key, [node]); // 初始化为数组
    }
  };

  const nodesToCheck = selectedFolders.length > 0 ? selectedFolders : bookmarks;

  console.log(
    "Nodes to check:",
    nodesToCheck.map((node) => node.title)
  );

  // 假设 dfs 是一个异步函数
  for (const folder of nodesToCheck) {
    await dfs(folder, handleLeafNode); // 使用 await 等待异步操作完成
  }

  // 输出 duplicates 映射的内容
  console.log(
    "All duplicates before filtering:",
    Array.from(duplicates.entries())
  );

  const filteredDuplicates = new Map(
    Array.from(duplicates.entries()).filter(([, nodes]) => {
      console.log("Checking nodes for key:", nodes); // 输出当前检查的节点
      return nodes.length > 1; // 确保节点数量大于 1
    })
  );

  console.log("filteredDuplicates", Array.from(filteredDuplicates.entries())); // 输出过滤后的重复项
  setResults(filteredDuplicates); // 这里的类型应该匹配
};

export const checkInvalid = async (
  bookmarks: chrome.bookmarks.BookmarkTreeNode[],
  selectedFolders: chrome.bookmarks.BookmarkTreeNode[],
  requestTimeout: number,
  maxRequests: number,
  setResults: React.Dispatch<
    React.SetStateAction<
      Map<string, chrome.bookmarks.BookmarkTreeNode[] | undefined>
    >
  >,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setIsHandling: React.Dispatch<React.SetStateAction<boolean>>,
  changeAction: (action: ActionType) => void
) => {
  if (bookmarks.length === 0 && selectedFolders.length === 0) return;
  setIsHandling(true);
  changeAction(ActionType.CHECK_INVALID);
  const invalids = new Map<string, chrome.bookmarks.BookmarkTreeNode[]>();
  let totalBookmarks =
    selectedFolders.length > 0
      ? countBookmarks(selectedFolders)
      : countBookmarks(bookmarks);

  let processedBookmarks = 0;
  const handleLeafNode = async (node: chrome.bookmarks.BookmarkTreeNode) => {
    if (!node.url) return;
    try {
      const res = await axios.get(node.url, {
        timeout: requestTimeout * 1000,
      });
      if (!res.status.toString().startsWith("2")) {
        const nodes = invalids.get(res.status.toString());
        if (nodes) {
          nodes.push(node);
        } else {
          invalids.set(res.status.toString(), [node]);
        }
        setResults(new Map(invalids)); // 实时更新状态
      }
    } catch (error: unknown) {
      let status = "Unknown";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          status = error.response.status.toString();
        } else if (error.request) {
          status = "Request Timeout";
        } else {
          status = error.message;
        }
      } else if (error instanceof Error) {
        status = error.message;
      }
      const nodes = invalids.get(status);
      if (nodes) {
        nodes.push(node);
      } else {
        invalids.set(status, [node]);
      }
      setResults(new Map(invalids)); // 实时更新状态
    } finally {
      setProgress((++processedBookmarks / totalBookmarks) * 100);
    }
  };

  const asyncQueue = async.queue(
    async (node: chrome.bookmarks.BookmarkTreeNode) => {
      await dfs(node, handleLeafNode);
    },
    maxRequests
  );
  asyncQueue.push(selectedFolders.length > 0 ? selectedFolders : bookmarks);
  asyncQueue.drain(() => {
    setIsHandling(false);
  });
};

export const removeBookmarks = async (ids: string[]) => {
  const promises = ids.map(async (id) => {
    await chrome.bookmarks.remove(id);
  });
  await Promise.all(promises);
};

export const removeNodesByIds = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  ids: string[]
): chrome.bookmarks.BookmarkTreeNode[] => {
  return nodes
    .map((node) => {
      if (node.children) {
        node.children = removeNodesByIds(node.children, ids);
      }
      return node;
    })
    .filter((node) => !ids.includes(node.id));
};

const countBookmarks = (node: chrome.bookmarks.BookmarkTreeNode[]): number => {
  return node.reduce((count, n) => {
    if (n.children) {
      return count + countBookmarks(n.children);
    }
    return count + 1;
  }, 0);
};
