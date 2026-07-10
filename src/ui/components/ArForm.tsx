import { FileCodeIcon, XIcon } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field.tsx";

import { Input } from "@/components/ui/input.tsx";

export function ArForm() {
    return (
        <form>
            <AttachmentGroup>
                <Attachment className="w-full">
        <AttachmentMedia>
          <FileCodeIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>message-renderer.tsx</AttachmentTitle>
          <AttachmentDescription>TypeScript · 12 KB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove message-renderer.tsx">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
                <Attachment state="uploading" className="w-full">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading · 64%</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Cancel upload">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
</AttachmentGroup>
        <Field>
            <FieldLabel htmlFor="input-path">
                Weekly 7 By Admin Path
            </FieldLabel>
            <Input id="input-path" type="file" />
            <FieldDescription>Select a folder..</FieldDescription>
        </Field>
        </form>
    );
}