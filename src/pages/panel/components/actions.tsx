import Settings from "@assets/img/settings.svg";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { Select, SelectItem } from "@nextui-org/select";
import { Tooltip } from "@nextui-org/tooltip";
interface ActionsProps {
  checkDuplicate: () => void;
  checkInvalid: () => void;
  isHandling?: boolean;
  openSettings: () => void;
  selectFolders: (folders: chrome.bookmarks.BookmarkTreeNode[]) => void;
  allFolders: chrome.bookmarks.BookmarkTreeNode[];
  selectedFolders: chrome.bookmarks.BookmarkTreeNode[];
}
export const Actions = (props: ActionsProps) => {
  const {
    checkDuplicate,
    checkInvalid,
    isHandling,
    openSettings,
    selectFolders,
    allFolders,
    selectedFolders,
  } = props;

  return (
    <div className="flex w-full">
      <div className="flex gap-4">
        <Button
          color="primary"
          onPress={checkDuplicate}
          isDisabled={isHandling}
          endContent={
            <Tooltip
              content={chrome.i18n.getMessage("checkDuplicateActionTip")}
            >
              <span>?</span>
            </Tooltip>
          }
        >
          {chrome.i18n.getMessage("checkDuplicates")}
        </Button>
        <Button
          onPress={checkInvalid}
          color="danger"
          isDisabled={isHandling}
          endContent={
            <Tooltip content={chrome.i18n.getMessage("checkInvalidActionTip")}>
              <span>?</span>
            </Tooltip>
          }
        >
          {chrome.i18n.getMessage("checkInvalids")}
        </Button>
        <div>
          <Select
            placeholder={chrome.i18n.getMessage("selectFolder")}
            selectionMode="multiple"
            className="max-w-xs min-w-[200px]"
            aria-label={chrome.i18n.getMessage("selectFolder")}
            onChange={(e) => {
              const v = e.target.value.split(",");
              const folders = allFolders.filter((folder) =>
                v.includes(folder.id)
              );
              selectFolders(folders);
            }}
            endContent={
              <Tooltip
                content={chrome.i18n.getMessage("selectFolderActionTip")}
              >
                <span>?</span>
              </Tooltip>
            }
          >
            {allFolders.map((folder) => (
              <SelectItem
                key={folder.id}
                value={folder.id}
                aria-selected={selectedFolders.some(
                  (selectedFolder) => selectedFolder.id === folder.id
                )}
              >
                {folder.title}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <Button isIconOnly className="ml-auto" onPress={openSettings}>
        <Image src={Settings} alt="Settings" width={24} height={24} />
      </Button>
    </div>
  );
};
