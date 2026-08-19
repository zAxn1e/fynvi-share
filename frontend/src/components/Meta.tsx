import Head from "next/head";
import useConfig from "../hooks/config.hook";

const Meta = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const config = useConfig();
  const appName = config.get("general.appName") || "Fynvi Share";

  const metaTitle =
    !title || title === "Home" || title === appName
      ? `${appName} - Home`
      : title.includes(appName)
        ? title
        : `${title} - ${appName}`;

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="og:title" content={metaTitle} />
      <meta
        name="og:description"
        content={
          description ?? "Fast, secure and self-hosted file sharing platform."
        }
      />
      <meta name="twitter:title" content={metaTitle} />
      <meta
        name="twitter:description"
        content={
          description ?? "Fast, secure and self-hosted file sharing platform."
        }
      />
    </Head>
  );
};

export default Meta;
