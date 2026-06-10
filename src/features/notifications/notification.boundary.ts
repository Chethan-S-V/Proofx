export type NotificationChannel = "in_app" | "email";

export type NotificationSubjectType =
  | "repository"
  | "issue"
  | "pull_request"
  | "discussion"
  | "release"
  | "security_alert";

export type NotificationEvent = {
  actorId: string;
  channel: NotificationChannel;
  message: string;
  repositoryId?: string;
  subjectId: string;
  subjectType: NotificationSubjectType;
};
