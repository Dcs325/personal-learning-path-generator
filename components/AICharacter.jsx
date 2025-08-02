import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced 3D Character Component with detailed face and natural movement
const Character3D = ({ position, message, isWalking, onMessageComplete, characterGender = 'female', isDancing = false }) => {
    const characterRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const [currentPosition, setCurrentPosition] = useState(position || [0, -1, 0]);
    const [walkDirection, setWalkDirection] = useState(1);
    const [walkCycle, setWalkCycle] = useState(0);
    const [isStanding, setIsStanding] = useState(!isWalking);
    const [idleAnimation, setIdleAnimation] = useState(0);
    const [danceAnimation, setDanceAnimation] = useState(0);

    // Natural walking and standing animation
    useFrame((state) => {
        if (characterRef.current) {
            const groundLevel = -1; // Fixed ground level
            
            if (isWalking && !isStanding) {
                // Walking movement
                const newX = currentPosition[0] + walkDirection * 0.012;
                
                // Reverse direction at screen edges
                if (newX > 2.2 || newX < -2.2) {
                    setWalkDirection(-walkDirection);
                    setIsStanding(true);
                    setTimeout(() => setIsStanding(false), 1500); // Stand for 1.5 seconds
                } else {
                    setCurrentPosition([newX, groundLevel, currentPosition[2]]);
                }
                
                // Walking cycle for natural leg movement
                setWalkCycle(state.clock.elapsedTime * 6);
                
                // Animate legs during walking
                if (leftLegRef.current && rightLegRef.current) {
                    leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.5;
                    rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
                }
                
                // Animate arms during walking
                if (leftArmRef.current && rightArmRef.current) {
                    leftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.2;
                    rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.2;
                }
                
                // Walking bob effect - subtle up/down movement
                const walkingBob = Math.abs(Math.sin(walkCycle)) * 0.05;
                
                characterRef.current.position.set(
                    currentPosition[0],
                    groundLevel + walkingBob,
                    currentPosition[2]
                );
                
                // Rotate character to face walking direction
                characterRef.current.rotation.y = walkDirection > 0 ? 0 : Math.PI;
            } else {
                // Standing/idle animation
                setIdleAnimation(state.clock.elapsedTime * 2);
                
                // Subtle breathing animation
                const breathingOffset = Math.sin(idleAnimation) * 0.02;
                characterRef.current.position.set(
                    currentPosition[0],
                    groundLevel + breathingOffset,
                    currentPosition[2]
                );
                
                // Reset limb positions when standing
                if (leftLegRef.current && rightLegRef.current) {
                    leftLegRef.current.rotation.x = 0;
                    rightLegRef.current.rotation.x = 0;
                }
                if (leftArmRef.current && rightArmRef.current) {
                    leftArmRef.current.rotation.x = 0;
                    leftArmRef.current.rotation.z = 0;
                    if (!isDancing) {
                        rightArmRef.current.rotation.x = 0;
                        rightArmRef.current.rotation.z = 0;
                    }
                }
            }
            
            // Dancing animation
            if (isDancing && leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current) {
                setDanceAnimation(state.clock.elapsedTime * 6);
                
                // Rhythmic arm movements
                leftArmRef.current.rotation.x = Math.sin(danceAnimation) * 0.8;
                leftArmRef.current.rotation.z = Math.cos(danceAnimation * 1.5) * 0.6;
                rightArmRef.current.rotation.x = Math.sin(danceAnimation + Math.PI) * 0.8;
                rightArmRef.current.rotation.z = Math.cos(danceAnimation * 1.5 + Math.PI) * 0.6;
                
                // Leg movements for dancing
                leftLegRef.current.rotation.x = Math.sin(danceAnimation * 2) * 0.3;
                rightLegRef.current.rotation.x = Math.sin(danceAnimation * 2 + Math.PI) * 0.3;
                
                // Body bounce effect
                const danceBounce = Math.abs(Math.sin(danceAnimation * 2)) * 0.1;
                characterRef.current.position.set(
                    currentPosition[0],
                    -1 + danceBounce,
                    currentPosition[2]
                );
                
                // Body rotation for dance moves
                characterRef.current.rotation.y = Math.sin(danceAnimation * 0.5) * 0.2;
            }
        }
    });

    // Character designs matching reference images exactly
    const characterDesigns = {
        female: {
            skin: '#FFDBAC', // Light peachy skin tone
            hair: '#2C1810', // Dark brown/black hair
            shirt: '#FFD700', // Yellow/golden shirt
            skirt: '#FF69B4', // Pink skirt
            shoes: '#8B4513', // Brown shoes
            eyeColor: '#000000' // Simple black eyes
        },
        male: {
            skin: '#FFDBAC', // Light peachy skin tone
            hair: '#8B4513', // Brown hair
            shirt: '#4169E1', // Blue shirt
            pants: '#808080', // Gray pants
            shoes: '#2F4F4F', // Dark gray shoes
            eyeColor: '#000000' // Simple black eyes
        }
    };

    const design = characterDesigns[characterGender];

    return (
        <group ref={characterRef} position={currentPosition} scale={[0.8, 0.8, 0.8]}>
            {/* Head - simple and clean like reference */}
            <mesh position={[0, 0.6, 0]}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshStandardMaterial color={design.skin} />
            </mesh>
            
            {/* Hair - simple cap-like style */}
            <mesh position={[0, 0.68, 0]}>
                <sphereGeometry args={[0.16, 24, 24]} />
                <meshStandardMaterial color={design.hair} />
            </mesh>
            
            {/* Torso/Shirt - clean cylindrical shape */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.18, 0.2, 0.4, 16]} />
                <meshStandardMaterial color={design.shirt} />
            </mesh>
            
            {/* Lower body - conditional rendering for skirt vs pants */}
            {characterGender === 'female' ? (
                // Female: Skirt
                <mesh position={[0, -0.15, 0]}>
                    <cylinderGeometry args={[0.25, 0.18, 0.3, 16]} />
                    <meshStandardMaterial color={design.skirt} />
                </mesh>
            ) : (
                // Male: Pants
                <mesh position={[0, -0.2, 0]}>
                    <cylinderGeometry args={[0.16, 0.18, 0.4, 16]} />
                    <meshStandardMaterial color={design.pants} />
                </mesh>
            )}
            
            {/* Simple eyes like reference images */}
            <mesh position={[-0.06, 0.62, 0.14]}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshStandardMaterial color={design.eyeColor} />
            </mesh>
            <mesh position={[0.06, 0.62, 0.14]}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshStandardMaterial color={design.eyeColor} />
            </mesh>
            
            {/* Simple smile */}
            <mesh position={[0, 0.55, 0.14]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.025, 0.005, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#FF6B6B" />
            </mesh>
            
            {/* Arms - simple and clean like reference */}
            <mesh ref={leftArmRef} position={[-0.28, 0.1, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
                <meshStandardMaterial color={design.skin} />
            </mesh>
            <mesh ref={rightArmRef} position={[0.28, 0.1, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
                <meshStandardMaterial color={design.skin} />
            </mesh>
            
            {/* Legs - conditional positioning based on gender */}
            {characterGender === 'female' ? (
                // Female legs (shorter, from under skirt)
                <>
                    <mesh ref={leftLegRef} position={[-0.08, -0.45, 0]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.25, 16]} />
                        <meshStandardMaterial color={design.skin} />
                    </mesh>
                    <mesh ref={rightLegRef} position={[0.08, -0.45, 0]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.25, 16]} />
                        <meshStandardMaterial color={design.skin} />
                    </mesh>
                </>
            ) : (
                // Male legs (longer, pants)
                <>
                    <mesh ref={leftLegRef} position={[-0.08, -0.5, 0]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
                        <meshStandardMaterial color={design.pants} />
                    </mesh>
                    <mesh ref={rightLegRef} position={[0.08, -0.5, 0]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
                        <meshStandardMaterial color={design.pants} />
                    </mesh>
                </>
            )}
            
            {/* Shoes - simple oval shapes like reference */}
            <mesh position={[-0.08, characterGender === 'female' ? -0.62 : -0.72, 0.02]}>
                <sphereGeometry args={[0.06, 16, 12]} />
                <meshStandardMaterial color={design.shoes} />
            </mesh>
            <mesh position={[0.08, characterGender === 'female' ? -0.62 : -0.72, 0.02]}>
                <sphereGeometry args={[0.06, 16, 12]} />
                <meshStandardMaterial color={design.shoes} />
            </mesh>
            
            {/* Speech Bubble */}
            {message && (
                <group position={[0, 1.2, 0]}>
                    <Box args={[2, 0.8, 0.1]} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#FFFFFF" opacity={0.9} transparent />
                    </Box>
                    <Text
                        position={[0, 0, 0.1]}
                        fontSize={0.15}
                        color="#1F2937"
                        anchorX="center"
                        anchorY="middle"
                        maxWidth={1.8}
                        textAlign="center"
                    >
                        {message}
                    </Text>
                </group>
            )}
        </group>
    );
};

// Main AI Character Component
const AICharacter = ({ 
    isVisible = true, 
    encouragementTrigger = null, 
    userProgress = {},
    onInteraction = () => {} 
}) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [isWalking, setIsWalking] = useState(false);
    const [isDancing, setIsDancing] = useState(false);
    const [messageQueue, setMessageQueue] = useState([]);
    const [showCharacter, setShowCharacter] = useState(isVisible);
    const [showSettings, setShowSettings] = useState(false);
    const [characterGender, setCharacterGender] = useState('female');
    const [voiceSettings, setVoiceSettings] = useState({ rate: 0.9, pitch: 1.1, volume: 0.8 });
    const [userStruggleDetection, setUserStruggleDetection] = useState({
        inactiveTime: 0,
        lastActivity: Date.now(),
        strugglingWithQuiz: false,
        strugglingWithNotes: false,
        hasShownStruggleHelp: false
    });

    // Encouragement messages based on context
    const encouragementMessages = {
        'study_start': [
            "Ready to learn something amazing today? 🌟",
            "Let's dive into some exciting knowledge! 📚",
            "Your learning journey continues! 🚀"
        ],
        'quiz_complete': [
            "Excellent work on that quiz! 🎉",
            "You're getting smarter every day! 🧠",
            "Great job! Knowledge is power! ⚡"
        ],
        'note_taking': [
            "Great note-taking! 📝",
            "Writing helps you remember! ✍️",
            "Those notes will be so helpful! 📋"
        ],
        'flashcard_review': [
            "Repetition is the key to mastery! 🔑",
            "You're building strong memories! 💪",
            "Practice makes perfect! ⭐"
        ],
        'struggle_detected': [
            "Don't worry, learning takes time! 🤗",
            "You've got this! Keep going! 💪",
            "Every expert was once a beginner! 🌱"
        ],
        'achievement': [
            "Wow! You just unlocked a new skill! 🏆",
            "Amazing progress! I'm proud of you! 🎊",
            "You're on fire today! 🔥"
        ],
        'break_reminder': [
            "Time for a quick break? 🧘‍♀️",
            "You've been studying hard! Rest up! ☕",
            "A little break helps the brain! 🧠"
        ],
        'struggle_help': [
            "I notice you might be stuck. Take a deep breath - you've got this! 🌸",
            "Feeling challenged? That's where real learning happens! 💪",
            "It's okay to take your time. Learning isn't a race! 🐢",
            "Stuck on something? Try breaking it into smaller steps! 🧩",
            "Remember, every expert struggled at first. You're on the right path! 🌟"
        ],
        'inactivity_check': [
            "Hey there! Still with me? Sometimes a short break helps! ☕",
            "I'm here if you need any encouragement! Take your time! 🤗",
            "Learning can be intense. Remember to breathe and stay positive! 🌸",
            "No rush! Quality learning takes time. You're doing great! ⏰"
        ],
        'quiz_struggle': [
            "Quizzes can be tricky! Remember, they're for learning, not judging! 🎯",
            "Take your time with each question. Think it through! 🤔",
            "If you're unsure, eliminate wrong answers first! 🔍",
            "Every wrong answer teaches you something new! 📚"
        ]
    };

    // Handle encouragement triggers
    useEffect(() => {
        if (encouragementTrigger && encouragementMessages[encouragementTrigger]) {
            const messages = encouragementMessages[encouragementTrigger];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showMessage(randomMessage);
        }
    }, [encouragementTrigger]);

    // Enhanced text-to-speech function with natural voices
    const speakMessage = (message) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            
            // Get available voices
            const voices = speechSynthesis.getVoices();
            
            // Select gender-appropriate voice
            let selectedVoice = null;
            if (characterGender === 'female') {
                selectedVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('woman') ||
                    voice.name.toLowerCase().includes('samantha') ||
                    voice.name.toLowerCase().includes('karen') ||
                    voice.name.toLowerCase().includes('victoria')
                ) || voices.find(voice => voice.gender === 'female');
            } else {
                selectedVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('male') ||
                    voice.name.toLowerCase().includes('man') ||
                    voice.name.toLowerCase().includes('alex') ||
                    voice.name.toLowerCase().includes('daniel') ||
                    voice.name.toLowerCase().includes('thomas')
                ) || voices.find(voice => voice.gender === 'male');
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            // Apply natural voice settings
            utterance.rate = voiceSettings.rate;
            utterance.pitch = characterGender === 'female' ? voiceSettings.pitch : voiceSettings.pitch - 0.3;
            utterance.volume = voiceSettings.volume;
            
            utterance.onend = () => {
                setTimeout(() => setCurrentMessage(''), 2000);
            };
            
            speechSynthesis.speak(utterance);
        } else {
            // Fallback: just show message for longer
            setTimeout(() => setCurrentMessage(''), 4000);
        }
    };
    
    // Load voices when component mounts
    useEffect(() => {
        const loadVoices = () => {
            if ('speechSynthesis' in window) {
                speechSynthesis.getVoices();
            }
        };
        
        loadVoices();
        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);
    
    // Automatic struggle detection disabled to prevent automatic speaking
    // useEffect(() => {
    //     const checkUserStruggle = () => {
    //         const now = Date.now();
    //         const timeSinceLastActivity = now - userStruggleDetection.lastActivity;
    //         
    //         // Check for inactivity (5 minutes)
    //         if (timeSinceLastActivity > 300000 && !userStruggleDetection.hasShownStruggleHelp) {
    //             showMessage(getRandomMessage('inactivity_check'));
    //             setUserStruggleDetection(prev => ({
    //                 ...prev,
    //                 hasShownStruggleHelp: true
    //             }));
    //         }
    //         
    //         // Reset help flag after 10 minutes
    //         if (timeSinceLastActivity > 600000) {
    //             setUserStruggleDetection(prev => ({
    //                 ...prev,
    //                 hasShownStruggleHelp: false,
    //                 lastActivity: now
    //             }));
    //         }
    //     };
    //     
    //     const interval = setInterval(checkUserStruggle, 30000); // Check every 30 seconds
    //     return () => clearInterval(interval);
    // }, [userStruggleDetection]);
    
    // Update activity when user interacts
    const updateUserActivity = () => {
        setUserStruggleDetection(prev => ({
            ...prev,
            lastActivity: Date.now(),
            hasShownStruggleHelp: false
        }));
    };
    
    // Enhanced struggle detection based on user behavior
    useEffect(() => {
        // Detect quiz struggles (if user spends too long on quiz tab)
        if (encouragementTrigger === 'quiz_struggle') {
            showMessage(getRandomMessage('quiz_struggle'));
            updateUserActivity();
        }
        
        // Detect general struggle patterns
        if (encouragementTrigger === 'struggle_detected') {
            showMessage(getRandomMessage('struggle_help'));
            updateUserActivity();
        }
    }, [encouragementTrigger]);

    // Show message with auto-clear
    const showMessage = (message) => {
        setCurrentMessage(message);
        setIsWalking(false);
        
        // Clean message for speech (remove emojis)
        const cleanMessage = message.replace(/[🌟📚🚀🎉🧠⚡📝✍️📋🔑💪⭐🤗🌱🏆🎊🔥🧘‍♀️☕]/g, '');
        speakMessage(cleanMessage);
        
        // Clear message after 4 seconds but keep character standing
        setTimeout(() => {
            setCurrentMessage('');
            // Character remains standing (isWalking stays false)
        }, 4000);
    };

    // Random encouragement disabled to prevent automatic speaking
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (!currentMessage) {
    //             const randomMessages = [
    //                 "You're doing great! Keep it up! 🌟",
    //                 "Learning is an adventure! 🗺️",
    //                 "Every step forward counts! 👣",
    //                 "I believe in you! 💫",
    //                 "Knowledge is your superpower! 🦸‍♀️"
    //             ];
    //             const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    //             showMessage(randomMessage);
    //         }
    //     }, 120000); // 2 minutes

    //     return () => clearInterval(interval);
    // }, [currentMessage]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 w-80 h-80 pointer-events-none z-40">
            {/* AI Friend Label */}
            {showCharacter && (
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg pointer-events-none">
                     <p className="text-sm font-medium text-gray-700">👤 Your 3D Friend</p>
                     <p className="text-xs text-gray-500">Here to help you learn!</p>
                 </div>
            )}
            
            {/* Only show Canvas when character is visible */}
            {showCharacter && (
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    style={{ background: 'transparent' }}
                >
                    <ambientLight intensity={0.6} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />
                    <directionalLight position={[-10, 10, 5]} intensity={0.5} />
                    
                    <Character3D 
                        position={[0, -1, 0]}
                        message={currentMessage}
                        isWalking={isWalking}
                        isDancing={isDancing}
                        onMessageComplete={() => setCurrentMessage('')}
                        characterGender={characterGender}
                    />
                </Canvas>
            )}
            
            {/* Character Controls - Always visible */}
            <div className="absolute bottom-2 left-2 pointer-events-auto">
                <div className="flex flex-col gap-2">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                         <button
                             onClick={() => {
                                 showMessage("Hi there! Let's dance! 💃🕺");
                                 setIsDancing(true);
                                 setTimeout(() => setIsDancing(false), 5000); // Dance for 5 seconds
                                 updateUserActivity();
                             }}
                             className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                             title="Dance"
                         >
                             💃
                         </button>
                         <button
                             onClick={() => {
                                 showMessage("You're amazing! Keep up the great work! 🌟");
                                 updateUserActivity();
                             }}
                             className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                             title="Get Encouragement"
                         >
                             💪
                         </button>
                         <button
                             onClick={() => {
                                 setShowCharacter(!showCharacter);
                                 updateUserActivity();
                             }}
                             className={`${showCharacter ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded-full transition-colors shadow-lg`}
                             title={showCharacter ? "Hide Character" : "Show Character"}
                         >
                             {showCharacter ? '👁️' : '👀'}
                         </button>
                         <button
                             onClick={() => {
                                 setShowSettings(!showSettings);
                                 updateUserActivity();
                             }}
                             className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                             title="Settings"
                         >
                             ⚙️
                         </button>
                     </div>
                    
                    {/* Character Customization - Toggleable */}
                    {showSettings && (
                        <div className="bg-white rounded-lg p-2 shadow-lg text-xs mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-600">Character:</span>
                                <select 
                                    value={characterGender} 
                                    onChange={(e) => setCharacterGender(e.target.value)}
                                    className="px-2 py-1 border rounded text-xs"
                                >
                                    <option value="female">👩 Female</option>
                                    <option value="male">👨 Male</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Voice:</span>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="1.5" 
                                    step="0.1" 
                                    value={voiceSettings.rate}
                                    onChange={(e) => setVoiceSettings({...voiceSettings, rate: parseFloat(e.target.value)})}
                                    className="w-16"
                                    title="Speech Rate"
                                />
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2" 
                                    step="0.1" 
                                    value={voiceSettings.pitch}
                                    onChange={(e) => setVoiceSettings({...voiceSettings, pitch: parseFloat(e.target.value)})}
                                    className="w-16"
                                    title="Voice Pitch"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AICharacter;