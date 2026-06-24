"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Pencil, PlusIcon, FileText } from "lucide-react";
import {
  getContentByKeyOptions,
  putContentByKeyMutation,
  postContentMutation,
} from "@/queries/@tanstack/react-query.gen";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RichEditor } from "@/components/shared/rich-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PrivacyPage = () => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data, isPending } = useQuery({
    ...getContentByKeyOptions({ path: { key: "privacy" } }),
  });
  const hasContent = !!data?.id;
  useEffect(() => {
    if (data?.content) {
      setContent(data.content);
    }
  }, [data]);

  const { mutate: save, isPending: isSaving } = useMutation({
    ...putContentByKeyMutation(),
    onSuccess: () => {
      toast.success("Privacy Policy updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: getContentByKeyOptions({ path: { key: "privacy" } }).queryKey,
      });
    },
    onError: (error) => {
      toast.error("Failed to save", {
        description: (error as Error)?.message || "An error occurred",
      });
    },
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    ...postContentMutation(),
    onSuccess: () => {
      toast.success("Privacy Policy created");
      queryClient.invalidateQueries({
        queryKey: getContentByKeyOptions({ path: { key: "privacy" } }).queryKey,
      });
    },
    onError: (error) => {
      toast.error("Failed to create", {
        description: (error as Error)?.message || "An error occurred",
      });
    },
  });

  function handleSave() {
    save({ path: { key: "privacy" }, body: { content } });
  }

  function handleCreate() {
    create({
      body: { key: "privacy", title: "Privacy Policy", content: "" },
    });
  }

  if (isPending) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <CardTitle>No Privacy Policy yet</CardTitle>
            <CardDescription>
              Create your privacy policy to outline how you handle user data
              and information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating && <Spinner />}
              <PlusIcon className="size-4" />
              Create Privacy Policy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? "Edit the privacy policy for your organisation"
              : "Review the privacy policy for your organisation"}
          </p>
        </div>
        {isEditing ? (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Spinner />}
            <Save className="size-4" />
            Save Changes
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </div>
      {isEditing ? (
        <RichEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing the privacy policy..."
        />
      ) : (
        <div className="rounded-md border border-border p-6">
          {content ? (
            <div
              className="content-display"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              No content available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PrivacyPage;
