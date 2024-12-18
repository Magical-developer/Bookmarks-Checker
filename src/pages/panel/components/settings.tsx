import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { Image } from "@nextui-org/image";
import WX from "@assets/img/wx.jpg";
import ZFB from "@assets/img/zfb.png";
import BTC from "@assets/img/btc-qr.png";
import ETH from "@assets/img/eth-qr.png";
import { Divider } from "@nextui-org/divider";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
  maxRequests: number;
  setMaxRequests: (maxRequests: number) => void;
  requestTimeout: number;
  setRequestTimeout: (requestTimeout: number) => void;
  useDomainForDuplicationCheck: boolean; //使用域名作为重复书签的判断标准
  setUseDomainForDuplicationCheck: (flag: boolean) => void;
  saveSettings: () => void;
}
export const Settings = (props: SettingsProps) => {
  const {
    visible,
    onClose,
    maxRequests,
    setMaxRequests,
    requestTimeout,
    setRequestTimeout,
    useDomainForDuplicationCheck,
    setUseDomainForDuplicationCheck,
    saveSettings,
  } = props;
  return (
    <Modal isOpen={visible} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>{chrome.i18n.getMessage("settings")}</ModalHeader>
        <Divider />
        <ModalBody className="gap-2">
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold">
                {chrome.i18n.getMessage("duplicationCheckSetting")}
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <Checkbox
                isSelected={useDomainForDuplicationCheck}
                onValueChange={(flag) => setUseDomainForDuplicationCheck(flag)}
              >
                {chrome.i18n.getMessage("useDomaiForDuplicationCheck")}
              </Checkbox>
              <p className="text-xs text-gray-500">
                {chrome.i18n.getMessage("useDomaiForDuplicationCheckTip")}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold">
                {chrome.i18n.getMessage("requestSetting")}
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-4">
              <Input
                label={chrome.i18n.getMessage("maxRequests")}
                type="number"
                value={maxRequests + ""}
                min={1}
                onChange={(e) => setMaxRequests(Number(e.target.value))}
                description={chrome.i18n.getMessage("maxRequestsTip")}
                max={10}
              />
              <Input
                label={chrome.i18n.getMessage("requestTimeout")}
                type="number"
                value={requestTimeout + ""}
                min={1}
                max={30}
                onChange={(e) => setRequestTimeout(Number(e.target.value))}
                endContent="Seconds"
                description={chrome.i18n.getMessage("requestTimeoutTip")}
              />
            </CardBody>
          </Card>
          <Button
            color="primary"
            onPress={() => {
              saveSettings(); // save settings
              onClose(); // close modal
            }}
          >
            {chrome.i18n.getMessage("save")}
          </Button>
        </ModalBody>
        <Divider />
        <ModalFooter className="flex flex-col">
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold">
                {chrome.i18n.getMessage("donate")}
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-2">
              <p>{chrome.i18n.getMessage("donateTip")}</p>
              <section className="flex flex-col text-gray-500">
                <div className="flex justify-around">
                  <DonationOption
                    src={WX}
                    alt="微信赞赏码"
                    description="WeChat"
                  />
                  <DonationOption
                    src={ZFB}
                    alt="支付宝赞赏码"
                    description="Alipay"
                  />
                </div>
                <Divider className="my-4" />
                <div className="flex justify-around">
                  <DonationOption
                    src={ETH}
                    alt="Eth-ERC20"
                    description="Crypto currency - Eth-ERC20"
                    address="0x96f8b24E61Ae9d4aC0f2Aa98ed9F6b3b1748B46a"
                  />
                  <DonationOption
                    src={BTC}
                    alt="BTC"
                    description="Crypto currency - BTC"
                    address="365L27jf7wYAa2T5d9FpRD2W6yL3F2N1kJ"
                  />
                </div>
              </section>
            </CardBody>
          </Card>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface DonationOptionProps {
  src: string;
  alt: string;
  description: string;
  address?: string;
}
const DonationOption = ({
  src,
  alt,
  description,
  address,
}: DonationOptionProps) => (
  <div className="flex flex-col items-center">
    <Image src={src} alt={alt} width={100} height={100} />
    <p>{description}</p>
    {address && <p>{address}</p>}
  </div>
);
