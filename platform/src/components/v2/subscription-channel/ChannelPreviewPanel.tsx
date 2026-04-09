import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelPreviewPost } from "./types";

type ChannelPreviewPanelProps = {
  posts: ChannelPreviewPost[];
};

export function ChannelPreviewPanel({ posts }: ChannelPreviewPanelProps) {
  return (
    <Card data-xray-id="subscription-channel-preview-panel">
      <CardHeader>
        <CardTitle>Preview recent posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No preview posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="rounded-lg border p-3">
              <p className="font-medium">{post.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
