import { forwardRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { ForwardedRef } from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  Separator,
  StrikeThroughSupSubToggles,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

type Props = {
  className?: string;
  markdown?: string;
};

export const DescriptionEditor = forwardRef<MDXEditorMethods, Props>(
  ({ className, markdown }: Props, ref: ForwardedRef<MDXEditorMethods>) => {
    return (
      <MDXEditor
        ref={ref}
        markdown={markdown || ""}
        className={className}
        contentEditableClassName="no-tw"
        plugins={[
          diffSourcePlugin({ diffMarkdown: markdown || "" }),
          headingsPlugin({ allowedHeadingLevels: [2, 3, 4, 5, 6] }),
          linkDialogPlugin(),
          linkPlugin(),
          listsPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <Separator />
                <ListsToggle />
                <Separator />
                <StrikeThroughSupSubToggles />
                <Separator />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    );
  },
);

DescriptionEditor.displayName = "DescriptionEditor";
