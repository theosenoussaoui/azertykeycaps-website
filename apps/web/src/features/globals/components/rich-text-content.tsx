/**
 * Simple rich text renderer for Lexical content from Payload CMS.
 *
 * TODO: Replace with proper @payloadcms/richtext-lexical/client renderer
 * when implementing full CMS content support.
 */
export function RichTextContent({ content }: { content: unknown }) {
  if (!content) return null;

  // If content is already a string (HTML), render it
  if (typeof content === "string") {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // If it's Lexical JSON, we need to parse it
  // For now, display a message that content is available
  return (
    <p className="text-muted-foreground">
      Le contenu de cette page est gere via le CMS.
    </p>
  );
}
