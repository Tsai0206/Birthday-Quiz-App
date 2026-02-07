'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';

interface ShareButtonProps {
    targetId: string;
    filename?: string;
    className?: string;
}

/**
 * ShareButton Component
 * Captures a screenshot of the target element and downloads it as an image.
 * Uses html2canvas to convert DOM element to image.
 *
 * @param targetId - ID of the DOM element to capture
 * @param filename - Optional custom filename (default: quiz-results-{timestamp}.png)
 * @param className - Optional custom CSS classes
 */
export default function ShareButton({
    targetId,
    filename = `quiz-results-${Date.now()}.png`,
    className = ''
}: ShareButtonProps) {
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCapture = async () => {
        setIsCapturing(true);

        try {
            const element = document.getElementById(targetId);

            if (!element) {
                console.error(`Element with ID "${targetId}" not found`);
                alert('無法找到要截圖的元素');
                setIsCapturing(false);
                return;
            }

            // Capture the element as canvas
            const canvas = await html2canvas(element, {
                backgroundColor: '#6D28D9', // Match the purple background
                scale: 2, // Higher quality (2x resolution)
                logging: false, // Disable console logs
                useCORS: true, // Allow cross-origin images
                allowTaint: true
            });

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('截圖失敗');
                    setIsCapturing(false);
                    return;
                }

                // Check if Web Share API is available (mobile devices)
                if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    const file = new File([blob], filename, { type: 'image/png' });

                    navigator.share({
                        title: '🎮 生日問答結果',
                        text: '快來看看我的排名！',
                        files: [file]
                    })
                        .then(() => {
                            console.log('Shared successfully');
                        })
                        .catch((error) => {
                            console.log('Error sharing:', error);
                            // Fallback to download
                            downloadImage(canvas, filename);
                        });
                } else {
                    // Desktop or browsers without Share API - download directly
                    downloadImage(canvas, filename);
                }

                setIsCapturing(false);
            }, 'image/png');
        } catch (error) {
            console.error('Screenshot failed:', error);
            alert('截圖失敗，請稍後再試');
            setIsCapturing(false);
        }
    };

    const downloadImage = (canvas: HTMLCanvasElement, filename: string) => {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleCapture}
            disabled={isCapturing}
            className={`${className} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
            {isCapturing ? (
                <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    處理中...
                </>
            ) : (
                <>
                    📸 截圖分享
                </>
            )}
        </button>
    );
}
