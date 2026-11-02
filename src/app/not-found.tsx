import { MessagePage } from "@/components/site/MessagePage";

export default function NotFound() {
  return (
    <MessagePage
      title="This page doesn't exist"
      body="The address may be mistyped, or the page has moved. If you were sent a form link, open the full link from your message."
    />
  );
}
