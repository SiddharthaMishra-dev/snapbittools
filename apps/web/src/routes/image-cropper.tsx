import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import {
    IconCloudUpload,
    IconDownload,
    IconRotateClockwise,
    IconFlipHorizontal,
    IconFlipVertical,
    IconCrop,
    IconLock,
    IconArrowsMaximize,
} from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
    {
        question: "Is there a limit on image resolution for cropping?",
        answer: "Our tool can handle high-resolution images, but the experience depends on your device's memory since all processing happens locally. For extremely large files, you might experience slight delays.",
    },
    {
        question: "Can I maintain a specific aspect ratio?",
        answer: "Yes, you can choose from preset aspect ratios like 1:1, 4:3, or 16:9, or use a custom freeform selection to crop exactly as you need.",
    },
    {
        question: "Does cropping reduce image quality?",
        answer: "Cropping by itself doesn't reduce quality. However, when you save the cropped image, you can choose the output quality level to balance file size and clarity.",
    },
    {
        question: "What happens to my original image file?",
        answer: "Nothing! Your original file remains untouched on your device. The tool creates a new cropped version that you can download separately.",
    },
];

export const Route = createFileRoute("/image-cropper")({
    head: () =>
        getSeoMetadata({
            title: "Image Cropper | Crop & Resize Images Online | SnapBit Tools",
            description: "Crop, rotate, and resize your images with pixel-perfect precision. 100% private, client-side, and works offline.",
            keywords: ["image cropper", "crop photos online", "resize images", "rotate image", "photo editor"],
            url: "/image-cropper",
            type: "software",
            faqs,
        }),
    component: RouteComponent,
});

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

function RouteComponent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCrop, setIsCrop] = useState(false);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [flipHorizontal, setFlipHorizontal] = useState(false);
    const [flipVertical, setFlipVertical] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [scale, setScale] = useState(1);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setIsUploading(true);
            const img = new Image();
            img.onload = () => {
                setImage(img);

                const initialSize = Math.min(img.width, img.height, 300);
                setCropArea({
                    x: (img.width - initialSize) / 2,
                    y: (img.height - initialSize) / 2,
                    width: initialSize,
                    height: initialSize,
                });
                setIsUploading(false);
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setIsUploading(true);
            const img = new Image();
            img.onload = () => {
                setImage(img);
                const initialSize = Math.min(img.width, img.height, 300);
                setCropArea({
                    x: (img.width - initialSize) / 2,
                    y: (img.height - initialSize) / 2,
                    width: initialSize,
                    height: initialSize,
                });
                setIsUploading(false);
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleCropVisible = () => {
        setIsCrop(!isCrop);
        if (!isCrop && image) {
            const initialSize = Math.min(image.width, image.height, 300);
            setCropArea({
                x: (image.width - initialSize) / 2,
                y: (image.height - initialSize) / 2,
                width: initialSize,
                height: initialSize,
            });
        }
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxWidth = 720;
        const maxHeight = 480;
        const calculatedScale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        setScale(calculatedScale); // Store scale for consistent use

        const displayWidth = image.width * calculatedScale;
        const displayHeight = image.height * calculatedScale;

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

        ctx.restore();

        if (!isCrop) return;

        // Crop overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cropX = cropArea.x * calculatedScale;
        const cropY = cropArea.y * calculatedScale;
        const cropWidth = cropArea.width * calculatedScale;
        const cropHeight = cropArea.height * calculatedScale;

        // Clear crop area and redraw the image in that area
        ctx.clearRect(cropX, cropY, cropWidth, cropHeight);

        // Apply transformations for the cropped area
        ctx.save();
        ctx.translate(cropX + cropWidth / 2, cropY + cropHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
        ctx.translate(-(cropWidth / 2), -(cropHeight / 2));

        ctx.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropWidth, cropHeight);

        ctx.restore();

        // Draw crop border
        ctx.strokeStyle = "#3b82f6"; // brand-primary
        ctx.lineWidth = 2;
        ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);

        // Draw resize handles
        const handleSize = 10;
        ctx.fillStyle = "#3b82f6"; // brand-primary

        // Corner handles
        ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(cropX - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize);

        // Edge handles
        ctx.fillRect(cropX + cropWidth / 2 - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(cropX + cropWidth / 2 - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(cropX - handleSize / 2, cropY + cropHeight / 2 - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY + cropHeight / 2 - handleSize / 2, handleSize, handleSize);
    };

    useEffect(() => {
        if (image) {
            drawCanvas();
        }
    }, [image, cropArea, rotation, flipHorizontal, flipVertical, isCrop]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const getResizeHandle = (mousePos: { x: number; y: number }) => {
        if (!image || !isCrop) return null;

        const cropX = cropArea.x * scale;
        const cropY = cropArea.y * scale;
        const cropWidth = cropArea.width * scale;
        const cropHeight = cropArea.height * scale;
        const handleSize = 10;
        const tolerance = handleSize / 2;

        const handles = {
            "top-left": { x: cropX, y: cropY },
            "top-right": { x: cropX + cropWidth, y: cropY },
            "bottom-left": { x: cropX, y: cropY + cropHeight },
            "bottom-right": { x: cropX + cropWidth, y: cropY + cropHeight },
            top: { x: cropX + cropWidth / 2, y: cropY },
            bottom: { x: cropX + cropWidth / 2, y: cropY + cropHeight },
            left: { x: cropX, y: cropY + cropHeight / 2 },
            right: { x: cropX + cropWidth, y: cropY + cropHeight / 2 },
        };

        for (const [handle, pos] of Object.entries(handles)) {
            if (
                mousePos.x >= pos.x - tolerance &&
                mousePos.x <= pos.x + tolerance &&
                mousePos.y >= pos.y - tolerance &&
                mousePos.y <= pos.y + tolerance
            ) {
                return handle;
            }
        }

        return null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCrop) return;

        const mousePos = getMousePos(e);
        const handle = getResizeHandle(mousePos);

        if (handle) {
            setIsResizing(handle);
            e.preventDefault();
        } else {
            // Check if click is inside crop area for dragging
            if (!image) return;

            const cropX = cropArea.x * scale;
            const cropY = cropArea.y * scale;
            const cropWidth = cropArea.width * scale;
            const cropHeight = cropArea.height * scale;

            if (mousePos.x >= cropX && mousePos.x <= cropX + cropWidth && mousePos.y >= cropY && mousePos.y <= cropY + cropHeight) {
                setIsDragging(true);
                setDragOffset({
                    x: mousePos.x - cropX,
                    y: mousePos.y - cropY,
                });
                e.preventDefault();
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!image || !isCrop) return;

        const mousePos = getMousePos(e);
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (isResizing) {
            const newCropArea = { ...cropArea };
            const mouseX = mousePos.x / scale;
            const mouseY = mousePos.y / scale;

            switch (isResizing) {
                case "top-left":
                    newCropArea.width += newCropArea.x - mouseX;
                    newCropArea.height += newCropArea.y - mouseY;
                    newCropArea.x = mouseX;
                    newCropArea.y = mouseY;
                    break;
                case "top-right":
                    newCropArea.width = mouseX - newCropArea.x;
                    newCropArea.height += newCropArea.y - mouseY;
                    newCropArea.y = mouseY;
                    break;
                case "bottom-left":
                    newCropArea.width += newCropArea.x - mouseX;
                    newCropArea.height = mouseY - newCropArea.y;
                    newCropArea.x = mouseX;
                    break;
                case "bottom-right":
                    newCropArea.width = mouseX - newCropArea.x;
                    newCropArea.height = mouseY - newCropArea.y;
                    break;
                case "top":
                    newCropArea.height += newCropArea.y - mouseY;
                    newCropArea.y = mouseY;
                    break;
                case "bottom":
                    newCropArea.height = mouseY - newCropArea.y;
                    break;
                case "left":
                    newCropArea.width += newCropArea.x - mouseX;
                    newCropArea.x = mouseX;
                    break;
                case "right":
                    newCropArea.width = mouseX - newCropArea.x;
                    break;
            }

            // Constrain to image bounds and minimum size
            newCropArea.x = Math.max(0, Math.min(newCropArea.x, image.width - 20));
            newCropArea.y = Math.max(0, Math.min(newCropArea.y, image.height - 20));
            newCropArea.width = Math.max(20, Math.min(newCropArea.width, image.width - newCropArea.x));
            newCropArea.height = Math.max(20, Math.min(newCropArea.height, image.height - newCropArea.y));

            setCropArea(newCropArea);
        } else if (isDragging) {
            const newX = (mousePos.x - dragOffset.x) / scale;
            const newY = (mousePos.y - dragOffset.y) / scale;

            setCropArea({
                ...cropArea,
                x: Math.max(0, Math.min(newX, image.width - cropArea.width)),
                y: Math.max(0, Math.min(newY, image.height - cropArea.height)),
            });
        } else {
            // Update cursor based on hover
            const handle = getResizeHandle(mousePos);
            if (handle) {
                const cursors: { [key: string]: string } = {
                    "top-left": "nw-resize",
                    "top-right": "ne-resize",
                    "bottom-left": "sw-resize",
                    "bottom-right": "se-resize",
                    top: "n-resize",
                    bottom: "s-resize",
                    left: "w-resize",
                    right: "e-resize",
                };
                canvas.style.cursor = cursors[handle];
            } else {
                // Check if over crop area
                const cropX = cropArea.x * scale;
                const cropY = cropArea.y * scale;
                const cropWidth = cropArea.width * scale;
                const cropHeight = cropArea.height * scale;

                if (mousePos.x >= cropX && mousePos.x <= cropX + cropWidth && mousePos.y >= cropY && mousePos.y <= cropY + cropHeight) {
                    canvas.style.cursor = "move";
                } else {
                    canvas.style.cursor = "default";
                }
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(null);
    };

    const downloadCroppedImage = () => {
        if (!image || !isCrop) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        ctx.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);

        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `cropped_image_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        });
    };

    const resetImage = () => {
        setImage(null);
        setCropArea({ x: 0, y: 0, width: 200, height: 200 });
        setRotation(0);
        setFlipHorizontal(false);
        setFlipVertical(false);
        setIsCrop(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center justify-between">
            <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-100 mb-2">
                        Image <span className="text-brand-primary">Cropper</span>
                    </h1>
                    <p className="text-md text-gray-200">
                        Crop, resize, rotate & flip with precision. 100% private—nothing leaves your browser.
                    </p>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-6 w-full max-w-5xl">
                    {!image ? (
                        <>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-3 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                                    isDragging
                                        ? "border-brand-primary bg-brand-primary/20"
                                        : "border-gray-600 hover:border-brand-primary/40 hover:bg-gray-700"
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <IconCloudUpload
                                        className={`w-16 h-16 ${isDragging ? "text-brand-primary" : "text-gray-400"} transition-colors`}
                                    />
                                    <div>
                                        <p className="text-xl font-medium text-gray-100 mb-2">
                                            {isDragging ? "Drop your image here" : "Drag & drop your image here"}
                                        </p>
                                        <p className="text-gray-400 mb-4">or</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="text-sm px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                                        >
                                            {isUploading ? "Loading..." : "Choose Image"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-gray-400 text-xs mt-3 flex items-center justify-center gap-1">
                                🔒 Your files stay on your device. Nothing is uploaded to any server.
                            </p>

                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-100 mb-4">Crop Controls</h3>

                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        <IconRotateClockwise className="w-4 h-4" />
                                        <span>Rotate</span>
                                    </button>

                                    <button
                                        onClick={() => setFlipHorizontal(!flipHorizontal)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                            flipHorizontal ? "bg-brand-primary text-white" : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                                        }`}
                                    >
                                        <IconFlipHorizontal className="w-4 h-4" />
                                        <span>Flip H</span>
                                    </button>

                                    <button
                                        onClick={() => setFlipVertical(!flipVertical)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                            flipVertical ? "bg-brand-primary text-white" : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                                        }`}
                                    >
                                        <IconFlipVertical className="w-4 h-4" />
                                        <span>Flip V</span>
                                    </button>
                                    <button
                                        onClick={handleCropVisible}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                            isCrop ? "bg-brand-primary text-white" : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                                        }`}
                                    >
                                        <IconCrop className="w-4 h-4" />
                                        <span>{isCrop ? "Hide Crop" : "Show Crop"}</span>
                                    </button>
                                </div>

                                {isCrop && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <label className="block text-gray-300 mb-1">X Position</label>
                                            <input
                                                type="number"
                                                value={Math.round(cropArea.x)}
                                                onChange={(e) =>
                                                    setCropArea({
                                                        ...cropArea,
                                                        x: Math.max(0, parseInt(e.target.value) || 0),
                                                    })
                                                }
                                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">Y Position</label>
                                            <input
                                                type="number"
                                                value={Math.round(cropArea.y)}
                                                onChange={(e) =>
                                                    setCropArea({
                                                        ...cropArea,
                                                        y: Math.max(0, parseInt(e.target.value) || 0),
                                                    })
                                                }
                                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">Width</label>
                                            <input
                                                type="number"
                                                value={Math.round(cropArea.width)}
                                                onChange={(e) =>
                                                    setCropArea({
                                                        ...cropArea,
                                                        width: Math.max(20, parseInt(e.target.value) || 20),
                                                    })
                                                }
                                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">Height</label>
                                            <input
                                                type="number"
                                                value={Math.round(cropArea.height)}
                                                onChange={(e) =>
                                                    setCropArea({
                                                        ...cropArea,
                                                        height: Math.max(20, parseInt(e.target.value) || 20),
                                                    })
                                                }
                                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 flex justify-center">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    className="border-2 border-gray-600 rounded-lg cursor-default"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={resetImage}
                                    className="px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                >
                                    Clear Image
                                </button>

                                <button
                                    onClick={downloadCroppedImage}
                                    disabled={!isCrop}
                                    className="px-6 py-2 bg-green-700 text-green-100 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
                                >
                                    <IconDownload className="w-4 h-4" />
                                    <span>Download Cropped Image</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <ToolInfo
                    title="Image Cropper"
                    description="Our Image Cropper provides professional-grade image editing capabilities directly in your browser. Easily crop to specific aspect ratios, rotate images for better alignment, or flip them horizontally and vertically to get the perfect composition."
                    features={[
                        {
                            title: "Precision Editing",
                            description:
                                "Manually adjust crop coordinates and dimensions or use the intuitive on-canvas handles for visual editing.",
                            icon: IconCrop,
                        },
                        {
                            title: "Transformation Tools",
                            description: "Rotate images in 90-degree increments and flip them along both axes with a single click.",
                            icon: IconArrowsMaximize,
                        },
                        {
                            title: "Zero Uploads",
                            description: "Edit your photos with full confidence in your privacy. No data ever leaves your device.",
                            icon: IconLock,
                        },
                    ]}
                    steps={[
                        {
                            title: "Upload Image",
                            description: "Select an image from your device or use drag and drop to start editing.",
                        },
                        {
                            title: "Toggle Crop",
                            description: 'Click "Show Crop" to activate the cropping boundary on your image.',
                        },
                        {
                            title: "Adjust Boundary",
                            description: "Drag the crop box or use the corner handles to select the area you want to keep.",
                        },
                        {
                            title: "Save & Download",
                            description: "Configure your export options like format or quality and download your final cropped image.",
                        },
                    ]}
                    faqs={faqs}
                />
            </div>

            <RelatedTools currentToolSlug="image-cropper" category="Images" />

            <div className="mt-8">
                <p className="text-gray-400 text-xs text-center">
                    Crafted with care by{" "}
                    <a
                        href="https://sidme.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:text-brand-hover transition-colors"
                    >
                        sidme
                    </a>
                </p>
            </div>
        </div>
    );
}
