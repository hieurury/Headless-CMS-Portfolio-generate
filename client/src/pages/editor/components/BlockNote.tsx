import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
    BlockTypeSelect,
    BasicTextStyleButton,
    ColorStyleButton,
    NestBlockButton,
    TextAlignButton,
    UnnestBlockButton,
    useCreateBlockNote,
    FileReplaceButton,
    FileCaptionButton,
    CreateLinkButton,
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import { BlockNoteSchema, defaultProps, filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { MdCancel, MdCheckCircle, MdError, MdInfo } from "react-icons/md";

import clsx from "clsx";

// The types of alerts that users can choose from.
export const alertTypes = [
    {
        title: "Warning",
        value: "warning",
        icon: MdError,
        colorClass: "text-[#e69819]",
        bgClass: "bg-[#fff6e6] dark:bg-[#805d20]",
    },
    {
        title: "Error",
        value: "error",
        icon: MdCancel,
        colorClass: "text-[#d80d0d]",
        bgClass: "bg-[#ffe6e6] dark:bg-[#802020]",
    },
    {
        title: "Info",
        value: "info",
        icon: MdInfo,
        colorClass: "text-[#507aff]",
        bgClass: "bg-[#e6ebff] dark:bg-[#203380]",
    },
    {
        title: "Success",
        value: "success",
        icon: MdCheckCircle,
        colorClass: "text-[#0bc10b]",
        bgClass: "bg-[#e6ffe6] dark:bg-[#208020]",
    },
] as const;

export const createAlert = createReactBlockSpec(
    {
        type: "alert",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
            type: {
                default: "warning",
                values: ["warning", "error", "info", "success"],
            },
        },
        content: "inline",
    },
    {
        render: (props) => {
            const alertType = alertTypes.find(
                (a) => a.value === props.block.props.type,
            )!;
            const Icon = alertType.icon;
            return (
                <div className={clsx("flex justify-center items-center grow rounded min-h-[48px] p-1 my-2", alertType.bgClass)}>
                    {/*Icon which opens a menu to choose the Alert type*/}
                    <Menu withinPortal={false}>
                        <Menu.Target>
                            <div className="rounded-[16px] flex justify-center items-center mx-3 h-5 w-5 select-none cursor-pointer" contentEditable={false}>
                                <Icon
                                    className={alertType.colorClass}
                                    size={32}
                                />
                            </div>
                        </Menu.Target>
                        {/*Dropdown to change the Alert type*/}
                        <Menu.Dropdown>
                            <Menu.Label>Alert Type</Menu.Label>
                            <Menu.Divider />
                            {alertTypes.map((type) => {
                                const ItemIcon = type.icon;
                                return (
                                    <Menu.Item
                                        key={type.value}
                                        leftSection={
                                            <ItemIcon
                                                className={type.colorClass}
                                                size={16}
                                            />
                                        }
                                        onClick={() =>
                                            props.editor.updateBlock(props.block, {
                                                type: "alert",
                                                props: { type: type.value },
                                            })
                                        }
                                    >
                                        {type.title}
                                    </Menu.Item>
                                );
                            })}
                        </Menu.Dropdown>
                    </Menu>
                    {/*Rich text field for user to type in*/}
                    <div className="grow" ref={props.contentRef} />
                </div>
            );
        },
    },
);

const schema = BlockNoteSchema.create().extend({
    blockSpecs: {
        // Creates an instance of the Alert block and adds it to the schema.
        alert: createAlert(),
    },
});

const CustomFormattingToolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] w-full sticky top-0 z-50 order-first">
        <BlockTypeSelect key={"blockTypeSelect"} />
        {/* Extra button to toggle blue text & background */}
        <FileCaptionButton key={"fileCaptionButton"} />
        <FileReplaceButton key={"replaceFileButton"} />
        <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />
        <BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"} />
        <BasicTextStyleButton
            basicTextStyle={"underline"}
            key={"underlineStyleButton"}
        />
        <BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"} />
        {/* Extra button to toggle code styles */}
        <BasicTextStyleButton key={"codeStyleButton"} basicTextStyle={"code"} />
        <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"} />
        <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"} />
        <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"} />
        <ColorStyleButton key={"colorStyleButton"} />
        <NestBlockButton key={"nestBlockButton"} />
        <UnnestBlockButton key={"unnestBlockButton"} />
        <CreateLinkButton key={"createLinkButton"} />
    </div>
);

const insertAlert = (editor: typeof schema.BlockNoteEditor) => ({
    title: "Alert",
    onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
            type: "alert",
            content: [{ type: "text", text: "Hello World", styles: { bold: true } }],

        });
    },
    aliases: ["alert", "notification", "warning", "error", "info", "success"],
    group: "Other",
    icon: <MdInfo size={18} />,
});

export default function MyEditor() {
    // Create a new editor instance
    const editor = useCreateBlockNote({ schema });
    // Render the editor
    return (
        <div className="border border-[var(--color-border)] rounded-lg flex flex-col h-[500px] overflow-y-auto relative bg-[var(--color-bg)]">
            <BlockNoteView editor={editor} formattingToolbar={false} slashMenu={false}>
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) =>
                        filterSuggestionItems(
                            [...getDefaultReactSlashMenuItems(editor), insertAlert(editor)],
                            query
                        )
                    }
                />
                <CustomFormattingToolbar />
            </BlockNoteView>
        </div>
    );
}
