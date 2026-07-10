import { z } from "zod";

export const sharePostSchema = z.object({
  postId: z.string().min(1),
  recipientIds: z.array(z.string().min(1)).min(1, "Choose at least one person."),
});

export const createPostSchema = z
  .object({
    attachmentName: z.string(),
    challengePrize: z.number().int().nonnegative(),
    postType: z.enum(["text", "photo", "video", "challenge"]),
    text: z.string().trim().min(1, "Write something before publishing.").max(3000),
  })
  .superRefine((value, context) => {
    if (value.postType === "challenge" && value.challengePrize < 1) {
      context.addIssue({ code: "custom", message: "Add prize money for the challenge.", path: ["challengePrize"] });
    }
    if ((value.postType === "photo" || value.postType === "video") && !value.attachmentName) {
      context.addIssue({ code: "custom", message: `Choose a ${value.postType} to publish.`, path: ["attachmentName"] });
    }
  });

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});
