"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import {
    ImageIcon,
    PaperclipIcon,
    PlusIcon,
    SendIcon,
    SquareIcon,
    XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, {
    memo,
    Children,
    createContext,
    Fragment,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const AttachmentsContext = createContext(null);

export const usePromptInputAttachments = () => {
    const context = useContext(AttachmentsContext);

    if (!context) {
        throw new Error(
            "usePromptInputAttachments must be used within a PromptInput",
        );
    }

    return context;
};

export function PromptInputAttachment({
    data,
    sx,
}) {
    const attachments = usePromptInputAttachments();

    return (
        <Box
            key={data.id}
            sx={{
                position: "relative",
                width: 56,
                height: 56,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                "&:hover .remove-button": {
                    opacity: 1,
                },
                ...sx,
            }}
        >
            {data.mediaType?.startsWith("image/") && data.url ? (
                <Box
                    component="img"
                    alt={data.filename || "attachment"}
                    src={data.url}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 1,
                    }}
                />
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                    }}
                >
                    <PaperclipIcon size={16} />
                </Box>
            )}
            <IconButton
                className="remove-button"
                aria-label="Remove attachment"
                onClick={() => attachments.remove(data.id)}
                size="small"
                sx={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 24,
                    height: 24,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    "&:hover": {
                        bgcolor: "action.hover",
                    },
                }}
            >
                <XIcon size={12} />
            </IconButton>
        </Box>
    );
}

export function PromptInputAttachments({
    children,
    sx,
}) {
    const attachments = usePromptInputAttachments();
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        const el = contentRef.current;
        if (!el) {
            return;
        }
        const ro = new ResizeObserver(() => {
            setHeight(el.getBoundingClientRect().height);
        });
        ro.observe(el);
        setHeight(el.getBoundingClientRect().height);
        return () => ro.disconnect();
    }, []);

    return (
        <Box
            aria-live="polite"
            sx={{
                overflow: "hidden",
                transition: "height 200ms ease-out",
                height: attachments.files.length ? height : 0,
                ...sx,
            }}
        >
            <Box
                ref={contentRef}
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    p: 1.5,
                    pt: 1.5,
                }}
            >
                {attachments.files.map((file) => (
                    <Fragment key={file.id}>{children(file)}</Fragment>
                ))}
            </Box>
        </Box>
    );
}

export const PromptInputActionAddAttachments = ({
    label = "Add photos or files",
    onClick,
    ...props
}) => {
    const attachments = usePromptInputAttachments();

    return (
        <MenuItem
            {...props}
            onClick={(e) => {
                e.preventDefault();
                attachments.openFileDialog();
                onClick?.(e);
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ImageIcon size={16} />
                {label}
            </Box>
        </MenuItem>
    );
};

export const PromptInput = ({
    sx,
    accept,
    multiple,
    globalDrop,
    syncHiddenInput,
    maxFiles,
    maxFileSize,
    onError,
    onSubmit,
    children,
}) => {
    const [items, setItems] = useState([]);
    const inputRef = useRef(null);
    const anchorRef = useRef(null);
    const formRef = useRef(null);

    // Find nearest form to scope drag & drop
    useEffect(() => {
        const root = anchorRef.current?.closest("form");
        if (root instanceof HTMLFormElement) {
            formRef.current = root;
        }
    }, []);

    const openFileDialog = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const matchesAccept = useCallback(
        (f) => {
            if (!accept || accept.trim() === "") {
                return true;
            }
            // Simple check: if accept includes "image/*", filter to images; otherwise allow.
            if (accept.includes("image/*")) {
                return f.type.startsWith("image/");
            }
            return true;
        },
        [accept],
    );

    const add = useCallback(
        (files) => {
            const incoming = Array.from(files);
            const accepted = incoming.filter((f) => matchesAccept(f));
            if (accepted.length === 0) {
                onError?.({
                    code: "accept",
                    message: "No files match the accepted types.",
                });
                return;
            }
            const withinSize = (f) =>
                maxFileSize ? f.size <= maxFileSize : true;
            const sized = accepted.filter(withinSize);
            if (sized.length === 0 && accepted.length > 0) {
                onError?.({
                    code: "max_file_size",
                    message: "All files exceed the maximum size.",
                });
                return;
            }
            setItems((prev) => {
                const capacity =
                    typeof maxFiles === "number"
                        ? Math.max(0, maxFiles - prev.length)
                        : undefined;
                const capped =
                    typeof capacity === "number" ? sized.slice(0, capacity) : sized;
                if (typeof capacity === "number" && sized.length > capacity) {
                    onError?.({
                        code: "max_files",
                        message: "Too many files. Some were not added.",
                    });
                }
                const next = [];
                for (const file of capped) {
                    next.push({
                        id: nanoid(),
                        type: "file",
                        url: URL.createObjectURL(file),
                        mediaType: file.type,
                        filename: file.name,
                    });
                }
                return prev.concat(next);
            });
        },
        [matchesAccept, maxFiles, maxFileSize, onError],
    );

    const remove = useCallback((id) => {
        setItems((prev) => {
            const found = prev.find((file) => file.id === id);
            if (found?.url) {
                URL.revokeObjectURL(found.url);
            }
            return prev.filter((file) => file.id !== id);
        });
    }, []);

    const clear = useCallback(() => {
        setItems((prev) => {
            for (const file of prev) {
                if (file.url) {
                    URL.revokeObjectURL(file.url);
                }
            }
            return [];
        });
    }, []);

    // Note: File input cannot be programmatically set for security reasons
    // The syncHiddenInput prop is no longer functional
    useEffect(() => {
        if (syncHiddenInput && inputRef.current) {
            // Clear the input when items are cleared
            if (items.length === 0) {
                inputRef.current.value = "";
            }
        }
    }, [items, syncHiddenInput]);

    // Attach drop handlers on nearest form and document (opt-in)
    useEffect(() => {
        const form = formRef.current;
        if (!form) {
            return;
        }
        const onDragOver = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
        };
        const onDrop = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                add(e.dataTransfer.files);
            }
        };
        form.addEventListener("dragover", onDragOver);
        form.addEventListener("drop", onDrop);
        return () => {
            form.removeEventListener("dragover", onDragOver);
            form.removeEventListener("drop", onDrop);
        };
    }, [add]);

    useEffect(() => {
        if (!globalDrop) {
            return;
        }
        const onDragOver = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
        };
        const onDrop = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                add(e.dataTransfer.files);
            }
        };
        document.addEventListener("dragover", onDragOver);
        document.addEventListener("drop", onDrop);
        return () => {
            document.removeEventListener("dragover", onDragOver);
            document.removeEventListener("drop", onDrop);
        };
    }, [add, globalDrop]);

    const handleChange = (event) => {
        if (event.currentTarget.files) {
            add(event.currentTarget.files);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const files = items.map(({ ...item }) => ({
            ...item,
        }));

        // Extract message from the form elements
        // We assume the textarea has name="message"
        const message = event.currentTarget.elements.message?.value || "";

        onSubmit({ text: message, files }, event);
    };

    const ctx = useMemo(
        () => ({
            files: items.map((item) => ({ ...item, id: item.id })),
            add,
            remove,
            clear,
            openFileDialog,
            fileInputRef: inputRef,
        }),
        [items, add, remove, clear, openFileDialog],
    );

    return (
        <AttachmentsContext.Provider value={ctx}>
            <Box
                component="span"
                aria-hidden="true"
                ref={anchorRef}
                sx={{ display: "none" }}
            />
            <Box
                component="input"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                ref={inputRef}
                type="file"
                sx={{ display: "none" }}
            />
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "& > *:not(:last-child)": {
                        borderBottom: 1,
                        borderColor: "divider",
                    },
                    ...sx,
                }}
            >
                {children}
            </Box>
        </AttachmentsContext.Provider>
    );
};

export const PromptInputBody = ({ children, sx }) => (
    <Box sx={{ display: "flex", flexDirection: "column", ...sx }}>{children}</Box>
);

export const PromptInputTextarea = ({
    onChange,
    placeholder = "What would you like to know?",
    sx,
    ...props
}) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            // Don't submit if IME composition is in progress
            if (e.nativeEvent.isComposing) {
                return;
            }

            if (e.shiftKey) {
                // Allow newline
                return;
            }

            // Submit on Enter (without Shift)
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    return (
        <InputBase
            multiline
            name="message"
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxRows={3}
            sx={{
                width: "100%",
                p: 1.5,
                "& .MuiInputBase-input": {
                    resize: "none",
                    overflow: "auto",
                    fieldSizing: "content",
                },
                ...sx,
            }}
            {...props}
        />
    );
};

export const PromptInputToolbar = ({
    children,
    sx,
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 0.5,
            ...sx,
        }}
    >
        {children}
    </Box>
);

export const PromptInputTools = ({ children, sx }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            "& > button:first-of-type": {
                borderBottomLeftRadius: 12,
            },
            ...sx,
        }}
    >
        {children}
    </Box>
);

export const PromptInputButton = memo(
    ({
        variant = "text",
        size,
        children,
        sx,
        ...props
    }) => {
        const isIconButton = Children.count(children) === 1;

        if (isIconButton) {
            return (
                <IconButton
                    size={size || "medium"}
                    sx={{
                        borderRadius: 2,
                        color: variant === "text" ? "text.secondary" : undefined,
                        ...sx,
                    }}
                    {...props}
                >
                    {children}
                </IconButton>
            );
        }

        return (
            <Button
                variant={variant}
                size={size || "medium"}
                sx={{
                    minWidth: "auto",
                    px: 1.5,
                    gap: 0.75,
                    borderRadius: 2,
                    flexShrink: 0,
                    color: variant === "text" ? "text.secondary" : undefined,
                    ...sx,
                }}
                {...props}
            >
                {children}
            </Button>
        );
    },
);

PromptInputButton.displayName = "PromptInputButton";

export const PromptInputActionMenu = ({
    children,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const childrenArray = Children.toArray(children);
    const trigger = childrenArray.find(
        (child) =>
            React.isValidElement(child) &&
            child.type === PromptInputActionMenuTrigger,
    );
    const content = childrenArray.find(
        (child) =>
            React.isValidElement(child) &&
            child.type === PromptInputActionMenuContent,
    );

    return (
        <>
            {trigger &&
                React.cloneElement(trigger, {
                    onClick: (e) => setAnchorEl(e.currentTarget),
                })}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                {content &&
                    React.cloneElement(content, {
                        onClose: () => setAnchorEl(null),
                    })}
            </Menu>
        </>
    );
};

export const PromptInputActionMenuTrigger = ({
    children,
    onClick,
    sx,
    ...props
}) => (
    <PromptInputButton onClick={onClick} sx={sx} {...props}>
        {children ?? <PlusIcon size={16} />}
    </PromptInputButton>
);

export const PromptInputActionMenuContent = ({
    children,
    onClose,
}) => (
    <Box onClick={onClose}>{children}</Box>
);

export const PromptInputActionMenuItem = (
    props,
) => <MenuItem {...props} />;

export const PromptInputSubmit = memo(
    ({
        variant = "contained",
        size = "medium",
        status,
        children,
        sx,
        ...props
    }) => {
        let Icon = <SendIcon size={16} />;

        if (status === "submitted") {
            Icon = <CircularProgress size={16} />;
        } else if (status === "streaming") {
            Icon = <SquareIcon size={16} />;
        } else if (status === "error") {
            Icon = <XIcon size={16} />;
        }

        const isIconOnly = !children;

        if (isIconOnly) {
            return (
                <IconButton
                    type="submit"
                    size={size}
                    sx={{
                        borderRadius: 2,
                        marginLeft: "auto",
                        ...sx,
                    }}
                    {...props}
                >
                    {Icon}
                </IconButton>
            );
        }

        return (
            <Button
                type="submit"
                variant={variant}
                size={size}
                sx={{
                    gap: 0.75,
                    borderRadius: 2,
                    ...sx,
                }}
                {...props}
            >
                {children}
            </Button>
        );
    },
);

PromptInputSubmit.displayName = "PromptInputSubmit";

export const PromptInputModelSelect = (props) => (
    <Select
        variant="standard"
        sx={{
            minWidth: 120,
            "& .MuiInput-root": {
                border: "none",
                bgcolor: "transparent",
                fontWeight: 500,
                color: "text.secondary",
                transition: "all 0.2s",
                "&:hover": {
                    bgcolor: "action.hover",
                    color: "text.primary",
                },
                "&.Mui-focused": {
                    bgcolor: "action.hover",
                    color: "text.primary",
                },
                "&:before, &:after": {
                    display: "none",
                },
            },
            "& .MuiSelect-select": {
                px: 1,
                py: 0.5,
                borderRadius: 1,
            },
        }}
        {...props}
    />
);
