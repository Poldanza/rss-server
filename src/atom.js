function entry({
  title,
  authorName,
  authorUri,
  categoryTerm,
  categoryLabel,
  content,
  id,
  mediaThumbnailUrl,
  linkHref,
  updatedDate,
  publishedDate
}) {
  return (
    `<entry>
      <author>
        <name>${authorName}</name>
        <uri>${authorUri}</uri>
      </author>
      <category term="${categoryTerm}" label="${categoryLabel}" />
      <content type="html">
        <img src="${mediaThumbnailUrl}" />
        <div>${content}</div>
      </content>
      <id>${id}</id>
      <media:thumbnail url="${mediaThumbnailUrl}" />
      <link href="${linkHref}" />
      <updated>${updatedDate}</updated>
      <published>${publishedDate}</published>
      <title>${title}</title>
    </entry>`
  );
}

function feed({
  feedCategoryTerm,
  feedCategoryLabel,
  feedUpdated,
  feedIcon,
  feedId,
  feedHrefXml,
  feedHrefHtml,
  feedSubtitle,
  feedTitle,
  entries
}) {
  const formattedEntries = entries.map((props) => {
    return {
      ...props,
      categoryTerm: feedCategoryTerm,
      categoryLabel: feedCategoryLabel
    };
  });
  return (
    `<?xml version="1.0" encoding="UTF-8"?>
    <feed
      xmlns="http://www.w3.org/2005/Atom"
      xmlns:media="http://search.yahoo.com/mrss/">
      <category term="${feedCategoryTerm}" label="${feedCategoryLabel}"/>
      <updated>${feedUpdated}</updated>
      <icon>${feedIcon}/</icon>
      <id>${feedId}</id>
      <link rel="self" href="${feedHrefXml}" type="application/atom+xml" />
      <link rel="alternate" href="${feedHrefHtml}" type="text/html" />
      ${feedSubtitle ? `<subtitle>${feedSubtitle}</subtitle>` : ""}
      <title>${feedTitle}</title>
      ${ formattedEntries.map(entry).join("\n") }
    </feed>`
  );
}

module.exports = {
  feed
};