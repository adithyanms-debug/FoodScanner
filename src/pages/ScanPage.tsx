import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import type { QuaggaJSResultObject } from '@ericblade/quagga2';
import Quagga from '@ericblade/quagga2';
import { Camera, Image as ImageIcon, Keyboard, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayCard } from '../components/ui/ClayCard';
import { ClayButton } from '../components/ui/ClayButton';
import { cn } from '../lib/utils';
import { useGemini } from '../hooks/useGemini';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

type ScanMode = 'camera' | 'upload' | 'manual';

export const ScanPage = () => {
    const [mode, setMode] = useState<ScanMode>('camera');
    const [manualBarcode, setManualBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [flash, setFlash] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const navigate = useNavigate();

    const { analyzePhoto, lookupBarcode } = useGemini();
    const { addScanToHistory } = useStore();

    const handleCapture = useCallback(async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setIsScanning(false);
        setFlash(true);
        setTimeout(() => setFlash(false), 500);

        try {
            const toastId = toast.loading('Analyzing product photo...');
            const result = await analyzePhoto.mutateAsync(imageSrc);

            const fullScan = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                type: 'label' as const,
                productName: result.productName || 'Unknown Product',
                brand: result.brand || 'Unknown Brand',
                nutrition: {
                    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
                },
                ingredients: [],
                allergens: [],
                healthScore: result.healthScore || 50,
                processingLevel: result.processingLevel || 'Unknown',
                greenFlags: result.greenFlags || [],
                redFlags: result.redFlags || [],
                confidenceScore: result.confidenceScore || 0,
                imageUrl: imageSrc
            };

            addScanToHistory(fullScan);
            toast.success('Analysis complete!', { id: toastId });
            navigate(`/product/${fullScan.id}`);
        } catch (e) {
            setIsScanning(true);
        }
    }, [webcamRef, navigate, analyzePhoto, addScanToHistory]);

    const onDetected = useCallback(async (result: QuaggaJSResultObject) => {
        if (!isScanning) return;
        const barcode = result.codeResult.code;
        if (barcode) {
            setIsScanning(false);
            setFlash(true);
            setTimeout(() => setFlash(false), 500);

            try {
                const toastId = toast.loading(`Looking up barcode: ${barcode}...`);
                const aiResult = await lookupBarcode.mutateAsync(barcode);

                const fullScan = {
                    id: uuidv4(),
                    barcode,
                    timestamp: new Date().toISOString(),
                    type: 'barcode' as const,
                    productName: aiResult.productName || 'Unknown Product',
                    brand: aiResult.brand || 'Unknown Brand',
                    nutrition: aiResult.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
                    ingredients: aiResult.ingredients || [],
                    allergens: aiResult.allergens || [],
                    healthScore: aiResult.healthScore || 50,
                    processingLevel: aiResult.processingLevel || 'Unknown',
                    greenFlags: aiResult.greenFlags || [],
                    redFlags: aiResult.redFlags || [],
                    confidenceScore: aiResult.confidenceScore || 0
                };

                addScanToHistory(fullScan);
                toast.success('Product identified!', { id: toastId });
                navigate(`/product/${fullScan.id}`);
            } catch (e) {
                setIsScanning(true);
                toast.error('Failed to look up barcode');
            }
        }
    }, [isScanning, navigate, addScanToHistory, lookupBarcode]);

    // @ts-ignore: used for side-effect initialization
    const _startQuagga = useCallback(() => {
        if (mode !== 'camera' || !isScanning) return;

        Quagga.init({
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: { min: 640 },
                    height: { min: 480 },
                    facingMode: "environment"
                },
                target: document.querySelector('#interactive.viewport') as HTMLElement
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"]
            }
        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(onDetected);

        return () => {
            Quagga.offDetected(onDetected);
            Quagga.stop();
        };
    }, [mode, isScanning, onDetected]);

    // Handle file drop/upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            try {
                const toastId = toast.loading('Analyzing uploaded photo...');
                const result = await analyzePhoto.mutateAsync(base64);

                const fullScan = {
                    id: uuidv4(),
                    timestamp: new Date().toISOString(),
                    type: 'label' as const,
                    productName: result.productName || 'Unknown Product',
                    brand: result.brand || 'Unknown Brand',
                    nutrition: {
                        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
                    },
                    ingredients: [],
                    allergens: [],
                    healthScore: result.healthScore || 50,
                    processingLevel: result.processingLevel || 'Unknown',
                    greenFlags: result.greenFlags || [],
                    redFlags: result.redFlags || [],
                    confidenceScore: result.confidenceScore || 0,
                    imageUrl: base64
                };

                addScanToHistory(fullScan);
                toast.success('Analysis complete!', { id: toastId });
                navigate(`/product/${fullScan.id}`);
            } catch (err) {
                // Error handled in useGemini
            }
        };
        reader.readAsDataURL(file);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBarcode.match(/^[0-9A-Za-z]+$/)) {
            toast.error('Invalid barcode format');
            return;
        }

        try {
            const toastId = toast.loading(`Looking up barcode: ${manualBarcode}...`);
            const aiResult = await lookupBarcode.mutateAsync(manualBarcode);

            const fullScan = {
                id: uuidv4(),
                barcode: manualBarcode,
                timestamp: new Date().toISOString(),
                type: 'barcode' as const,
                productName: aiResult.productName || 'Unknown Product',
                brand: aiResult.brand || 'Unknown Brand',
                nutrition: aiResult.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
                ingredients: aiResult.ingredients || [],
                allergens: aiResult.allergens || [],
                healthScore: aiResult.healthScore || 50,
                processingLevel: aiResult.processingLevel || 'Unknown',
                greenFlags: aiResult.greenFlags || [],
                redFlags: aiResult.redFlags || [],
                confidenceScore: aiResult.confidenceScore || 0
            };

            addScanToHistory(fullScan);
            toast.success('Product identified!', { id: toastId });
            navigate(`/product/${fullScan.id}`);
        } catch (err) {
            // Error handled by useGemini hook
        }
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden bg-background">
            {/* Flash Animation */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-success z-50 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Mode Selector */}
            <div className="absolute top-6 left-6 right-6 z-20">
                <ClayCard className="p-2 flex gap-2">
                    {([
                        { id: 'camera', icon: Camera, label: 'Camera' },
                        { id: 'upload', icon: ImageIcon, label: 'Upload' },
                        { id: 'manual', icon: Keyboard, label: 'Manual' }
                    ] as const).map((m) => (
                        <button
                            key={m.id}
                            onClick={() => {
                                setMode(m.id);
                                setIsScanning(m.id === 'camera');
                            }}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center py-3 rounded-clay-button transition-all duration-200",
                                mode === m.id ? "bg-background shadow-clay-button-active text-accent" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <m.icon size={20} className="mb-1" />
                            <span className="text-xs font-semibold">{m.label}</span>
                        </button>
                    ))}
                </ClayCard>
            </div>

            {/* Camera View */}
            {mode === 'camera' && (
                <div className="absolute inset-0 h-full w-full bg-black">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: 'environment' }}
                        className="w-full h-full object-cover"
                    />
                    {/* We need a hidden div for Quagga to mount to invisibly to avoid ruining styling */}
                    <div id="interactive" className="viewport hidden"></div>

                    {/* Scanner Overlay UI */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[80%] aspect-[4/3] max-h-[60%] relative">
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-[24px]" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-[24px]" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-[24px]" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-[24px]" />

                            {/* Laser line */}
                            {isScanning && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_2px_rgba(108,99,255,0.8)] animate-laser-scan" />
                            )}

                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-[24px] pointer-events-none" />
                        </div>
                    </div>

                    <div className="absolute bottom-32 left-0 right-0 flex justify-center z-20">
                        <ClayButton
                            onClick={handleCapture}
                            className="px-8 py-4 bg-white/90 backdrop-blur text-gray-800 focus:ring-4 focus:ring-accent/50"
                        >
                            <Camera className="w-6 h-6 mr-2 text-accent" />
                            Analyze Product Identity
                        </ClayButton>
                    </div>
                </div>
            )}

            {/* Upload View */}
            {mode === 'upload' && (
                <div className="pt-32 px-6 h-full flex flex-col pt-32 h-[calc(100vh-5rem)]">
                    <div className="flex-1 flex items-center justify-center">
                        <label className="clay-card w-full aspect-square max-h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-accent/50 cursor-pointer transition-colors relative group">
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            <motion.div whileHover={{ scale: 1.05 }} className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-clay-card">
                                <ImageIcon size={32} />
                            </motion.div>
                            <h3 className="font-poppins font-semibold text-xl mb-2 text-gray-800">Upload Photo</h3>
                            <p className="text-gray-500 text-sm text-center max-w-[200px]">Tap to browse for a product or label image</p>
                        </label>
                    </div>
                </div>
            )}

            {/* Manual Input View */}
            {mode === 'manual' && (
                <div className="pt-32 px-6 h-[calc(100vh-5rem)]">
                    <ClayCard className="mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <Keyboard size={24} />
                            </div>
                            <h2 className="font-poppins font-semibold text-xl">Enter Barcode</h2>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Barcode Number</label>
                                <input
                                    type="text"
                                    value={manualBarcode}
                                    onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))} // numbers only
                                    placeholder="e.g. 0123456789"
                                    className="w-full clay-input font-mono text-lg tracking-wider"
                                    autoFocus
                                />
                            </div>
                            <ClayButton type="submit" disabled={manualBarcode.length < 5} className="w-full bg-accent text-white mt-4 border-none shadow-[8px_8px_20px_#bebebe,_-8px_-8px_20px_#ffffff] hover:shadow-[5px_5px_10px_#bebebe,_-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#5c54d9,inset_-5px_-5px_10px_#7c72f5]">
                                <Search className="w-5 h-5 mr-2" />
                                Look Up Product
                            </ClayButton>
                        </form>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-warning/10 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 font-medium">Entering manually will simulate a lookup. For full AI functionality, please use the Camera or Upload options.</p>
                        </div>
                    </ClayCard>
                </div>
            )}

        </div>
    );
};
