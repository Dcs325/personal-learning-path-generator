import React, { useState } from 'react';
import jsPDF from 'jspdf';

const ExportUtils = ({ learningPath, pathData, onClose }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState('pdf');

    // Generate PDF export
    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Helper function to add text with word wrapping
            const addText = (text, fontSize = 12, isBold = false) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                
                const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                
                // Check if we need a new page
                if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                pdf.text(lines, margin, yPosition);
                yPosition += lines.length * fontSize * 0.5 + 5;
            };

            // Title
            addText(`Learning Path: ${pathData.skill}`, 20, true);
            addText(`Proficiency Level: ${pathData.proficiency}`, 14);
            
            if (pathData.learningStyle && pathData.learningStyle.length > 0) {
                addText(`Learning Styles: ${pathData.learningStyle.join(', ')}`, 12);
            }
            
            if (pathData.timePerWeek) {
                addText(`Time Commitment: ${pathData.timePerWeek} hours per week`, 12);
            }
            
            if (pathData.targetCompletion) {
                addText(`Target Completion: ${pathData.targetCompletion}`, 12);
            }
            
            yPosition += 10;
            addText('Learning Modules:', 16, true);
            yPosition += 5;

            // Modules
            learningPath.forEach((module, index) => {
                addText(`${index + 1}. ${module.moduleTitle}`, 14, true);
                addText(module.description, 11);
                
                if (module.estimatedHours) {
                    addText(`⏱️ Estimated Time: ${module.estimatedHours} hours`, 10);
                }
                
                if (module.difficultyRating) {
                    addText(`🎚️ Difficulty: ${module.difficultyRating}/5`, 10);
                }
                
                if (module.weeklySchedule) {
                    addText(`📅 Weekly Schedule: ${module.weeklySchedule}`, 10);
                }
                
                if (module.subTopics && module.subTopics.length > 0) {
                    addText('Topics to Cover:', 11, true);
                    module.subTopics.forEach(topic => {
                        addText(`• ${topic}`, 10);
                    });
                }
                
                if (module.recommendedBooks && module.recommendedBooks.length > 0) {
                    addText('📚 Recommended Books:', 11, true);
                    module.recommendedBooks.forEach(book => {
                        addText(`• ${book.title} by ${book.author}`, 10);
                    });
                }
                
                if (module.recommendedCourses && module.recommendedCourses.length > 0) {
                    addText('🎓 Recommended Courses:', 11, true);
                    module.recommendedCourses.forEach(course => {
                        addText(`• ${course.title} on ${course.platform}`, 10);
                    });
                }
                
                if (module.recommendedYouTubeVideos && module.recommendedYouTubeVideos.length > 0) {
                    addText('📺 Recommended YouTube Videos:', 11, true);
                    module.recommendedYouTubeVideos.forEach(video => {
                        addText(`• ${video.title} by ${video.channel}`, 10);
                        if (video.description) {
                            addText(`  ${video.description}`, 9);
                        }
                    });
                }
                
                if (module.learningTips && module.learningTips.length > 0) {
                    addText('💡 Learning Tips:', 11, true);
                    module.learningTips.forEach(tip => {
                        addText(`• ${tip}`, 10);
                    });
                }
                
                addText(`Suggested Resource: ${module.suggestedResourceType}`, 10);
                yPosition += 10;
            });

            // Footer
            const currentDate = new Date().toLocaleDateString();
            pdf.setFontSize(8);
            pdf.text(`Generated on ${currentDate} by Personal Learning Path Generator`, margin, pageHeight - 10);

            // Save the PDF
            const fileName = `${pathData.skill.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_learning_path.pdf`;
            pdf.save(fileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Generate calendar events (ICS format)
    const exportToCalendar = () => {
        setIsExporting(true);
        try {
            let icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Personal Learning Path Generator//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH'
            ];

            const startDate = new Date();
            const getWeeklyDate = (weekOffset, dayOfWeek = 1) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + (weekOffset * 7) + dayOfWeek);
                return date;
            };

            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            learningPath.forEach((module, index) => {
                const moduleStartDate = getWeeklyDate(index);
                const moduleEndDate = new Date(moduleStartDate);
                moduleEndDate.setHours(moduleEndDate.getHours() + (module.estimatedHours || 2));

                let description = `${module.description}\n\nTopics: ${module.subTopics ? module.subTopics.join(', ') : 'N/A'}\n\nResource: ${module.suggestedResourceType}`;
                
                if (module.recommendedBooks && module.recommendedBooks.length > 0) {
                    description += `\n\nRecommended Books:\n${module.recommendedBooks.map(book => `• ${book.title} by ${book.author}`).join('\n')}`;
                }
                
                if (module.recommendedCourses && module.recommendedCourses.length > 0) {
                    description += `\n\nRecommended Courses:\n${module.recommendedCourses.map(course => `• ${course.title} on ${course.platform}`).join('\n')}`;
                }
                
                if (module.recommendedYouTubeVideos && module.recommendedYouTubeVideos.length > 0) {
                    description += `\n\nRecommended YouTube Videos:\n${module.recommendedYouTubeVideos.map(video => `• ${video.title} by ${video.channel}`).join('\n')}`;
                }

                icsContent.push(
                    'BEGIN:VEVENT',
                    `UID:${Date.now()}-${index}@learningpath.com`,
                    `DTSTART:${formatDate(moduleStartDate)}`,
                    `DTEND:${formatDate(moduleEndDate)}`,
                    `SUMMARY:${module.moduleTitle} - ${pathData.skill}`,
                    `DESCRIPTION:${description}`,
                    `LOCATION:Online Learning`,
                    'STATUS:CONFIRMED',
                    'END:VEVENT'
                );
            });

            icsContent.push('END:VCALENDAR');

            const icsBlob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
            const url = URL.createObjectURL(icsBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${pathData.skill.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_learning_schedule.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error generating calendar:', error);
            alert('Failed to generate calendar. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExport = () => {
        if (exportType === 'pdf') {
            exportToPDF();
        } else if (exportType === 'calendar') {
            exportToCalendar();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">💾 Export Learning Path</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Export Format
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="pdf"
                                    checked={exportType === 'pdf'}
                                    onChange={(e) => setExportType(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm">📄 PDF Document</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="calendar"
                                    checked={exportType === 'calendar'}
                                    onChange={(e) => setExportType(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm">📅 Calendar Events (.ics)</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">
                            {exportType === 'pdf' 
                                ? '📄 Generate a comprehensive PDF with all learning modules, schedules, and tips.'
                                : '📅 Create calendar events for each learning module that you can import into Google Calendar, Outlook, or Apple Calendar.'
                            }
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                isExporting
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {isExporting ? '⏳ Exporting...' : `💾 Export ${exportType === 'pdf' ? 'PDF' : 'Calendar'}`}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportUtils;