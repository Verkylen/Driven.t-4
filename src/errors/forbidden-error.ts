import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "forbiddenError",
    message: "The client does not have access rights to the content",
  };
}
