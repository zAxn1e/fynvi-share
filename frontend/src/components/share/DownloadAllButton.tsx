import React, { useEffect, useState } from "react";
import { TbArchive, TbDownload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import toast from "../../utils/toast.util";
import { Button } from "../common/Button";

const DownloadAllButton = ({
  shareId,
  recipientId,
}: {
  shareId: string;
  recipientId?: string;
}) => {
  const [isZipReady, setIsZipReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslate();

  const downloadAll = async () => {
    setIsLoading(true);
    try {
      await shareService.downloadFile(shareId, "zip", recipientId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    shareService
      .getMetaData(shareId)
      .then((share) => setIsZipReady(share.isZipReady))
      .catch(() => {});

    const timer = setInterval(() => {
      shareService
        .getMetaData(shareId)
        .then((share) => {
          setIsZipReady(share.isZipReady);
          if (share.isZipReady) clearInterval(timer);
        })
        .catch(() => clearInterval(timer));
    }, 5000);

    return () => clearInterval(timer);
  }, [shareId]);

  return (
    <Button
      variant="primary"
      size="sm"
      loading={isLoading}
      leftIcon={<TbArchive size={16} />}
      onClick={() => {
        if (!isZipReady) {
          toast.error(t("share.notify.download-all-preparing") || "Archive is still preparing...");
        } else {
          downloadAll();
        }
      }}
    >
      <FormattedMessage id="share.button.download-all" defaultMessage="Download All (.zip)" />
    </Button>
  );
};

export default DownloadAllButton;
