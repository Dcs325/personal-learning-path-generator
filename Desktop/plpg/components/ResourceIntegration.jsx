import React, { useState, useEffect } from 'react';

const ResourceIntegration = ({ module, integratedResources, setIntegratedResources, onResourceAdd, onResourceRemove }) => {
    const resources = integratedResources || [];
    const setResources = setIntegratedResources || (() => {});
    const [newResource, setNewResource] = useState({ type: 'youtube', url: '', title: '', description: '' });
    const [validationStatus, setValidationStatus] = useState({});
    const [isValidating, setIsValidating] = useState(false);

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Validate resource URLs
    const validateResourceUrl = async (url, type) => {
        setIsValidating(true);
        try {
            // For YouTube videos
            if (type === 'youtube') {
                const videoId = extractYouTubeId(url);
                if (!videoId) {
                    return { valid: false, error: 'Invalid YouTube URL format' };
                }
                
                // Check if video exists by trying to fetch thumbnail
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                const response = await fetch(thumbnailUrl, { method: 'HEAD' });
                
                if (response.ok) {
                    return { valid: true, videoId, thumbnailUrl };
                } else {
                    return { valid: false, error: 'Video not found or private' };
                }
            }
            
            // For course platforms
            if (type === 'coursera' || type === 'udemy' || type === 'edx') {
                // Basic URL validation for course platforms
                const platformDomains = {
                    coursera: 'coursera.org',
                    udemy: 'udemy.com',
                    edx: 'edx.org'
                };
                
                const domain = platformDomains[type];
                if (url.includes(domain)) {
                    return { valid: true };
                } else {
                    return { valid: false, error: `URL must be from ${domain}` };
                }
            }
            
            // For general links
            if (type === 'link') {
                try {
                    new URL(url);
                    return { valid: true };
                } catch {
                    return { valid: false, error: 'Invalid URL format' };
                }
            }
            
            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Failed to validate URL' };
        } finally {
            setIsValidating(false);
        }
    };

    // Add new resource
    const handleAddResource = async () => {
        if (!newResource.url || !newResource.title) {
            alert('Please provide both URL and title');
            return;
        }

        const validation = await validateResourceUrl(newResource.url, newResource.type);
        
        if (!validation.valid) {
            alert(`Validation failed: ${validation.error}`);
            return;
        }

        const resource = {
            id: Date.now(),
            ...newResource,
            validationData: validation,
            addedAt: new Date()
        };

        const updatedResources = [...resources, resource];
        setResources(updatedResources);
        onResourceAdd?.(resource);
        
        // Reset form
        setNewResource({ type: 'youtube', url: '', title: '', description: '' });
    };

    // Remove resource
    const handleRemoveResource = (resourceId) => {
        const updatedResources = resources.filter(r => r.id !== resourceId);
        setResources(updatedResources);
        onResourceRemove?.(resourceId);
    };

    // Render YouTube embed
    const renderYouTubeEmbed = (resource) => {
        const videoId = resource.validationData?.videoId;
        if (!videoId) return null;

        return (
            <div className="aspect-video w-full">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={resource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                ></iframe>
            </div>
        );
    };

    // Render course platform link
    const renderCoursePlatformLink = (resource) => {
        const platformIcons = {
            coursera: '🎓',
            udemy: '📚',
            edx: '🏛️'
        };

        const platformColors = {
            coursera: 'bg-blue-500',
            udemy: 'bg-purple-500',
            edx: 'bg-red-500'
        };

        return (
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-4 rounded-lg text-white hover:opacity-90 transition-opacity ${platformColors[resource.type]}`}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{platformIcons[resource.type]}</span>
                    <div>
                        <h4 className="font-semibold">{resource.title}</h4>
                        <p className="text-sm opacity-90">{resource.description}</p>
                        <p className="text-xs opacity-75 mt-1">
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} Course
                        </p>
                    </div>
                </div>
            </a>
        );
    };

    // Render general link
    const renderGeneralLink = (resource) => {
        return (
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            >
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                        <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{resource.url}</p>
                    </div>
                </div>
            </a>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">📺 Integrated Resources</h3>
                <span className="text-sm text-gray-500">{resources.length} resources</span>
            </div>

            {/* AI-Recommended YouTube Videos */}
            {module?.recommendedYouTubeVideos && module.recommendedYouTubeVideos.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                    <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                        <span className="mr-2">🤖</span>
                        AI-Recommended YouTube Videos
                    </h4>
                    <div className="space-y-3">
                        {module.recommendedYouTubeVideos.map((video, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-red-200 flex items-start justify-between">
                                <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{video.title}</h5>
                                    <p className="text-sm text-gray-600">Channel: {video.channel}</p>
                                    <p className="text-xs text-gray-500 mt-1">{video.description}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setNewResource({
                                            type: 'youtube',
                                            url: `https://youtube.com/search?q=${encodeURIComponent(video.title + ' ' + video.channel)}`,
                                            title: video.title,
                                            description: `${video.description} (Channel: ${video.channel})`
                                        });
                                    }}
                                    className="ml-4 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                                >
                                    <span>➕</span>
                                    <span>Add</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs text-red-600">
                        💡 These videos are AI-recommended based on your learning module. Click "Add" to pre-fill the form below.
                    </div>
                </div>
            )}

            {/* Add New Resource Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Resource</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                        <select
                            value={newResource.type}
                            onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="youtube">📺 YouTube Video</option>
                            <option value="coursera">🎓 Coursera Course</option>
                            <option value="udemy">📚 Udemy Course</option>
                            <option value="edx">🏛️ edX Course</option>
                            <option value="link">🔗 General Link</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={newResource.title}
                            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                            placeholder="Resource title..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                    <input
                        type="url"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder={`Enter ${newResource.type} URL...`}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        placeholder="Brief description of the resource..."
                        rows="2"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>
                
                <button
                    onClick={handleAddResource}
                    disabled={isValidating || !newResource.url || !newResource.title}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {isValidating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Validating...</span>
                        </>
                    ) : (
                        <>
                            <span>➕</span>
                            <span>Add Resource</span>
                        </>
                    )}
                </button>
            </div>

            {/* Resources List */}
            {resources.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📺</div>
                    <p className="text-lg mb-2">No integrated resources yet</p>
                    <p className="text-sm">Add YouTube videos, course links, and other learning resources</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {resources.map((resource) => (
                        <div key={resource.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{resource.title}</h4>
                                    <p className="text-sm text-gray-600">{resource.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Added: {resource.addedAt.toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveResource(resource.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                                >
                                    🗑️
                                </button>
                            </div>
                            
                            {/* Render based on resource type */}
                            {resource.type === 'youtube' && renderYouTubeEmbed(resource)}
                            {(resource.type === 'coursera' || resource.type === 'udemy' || resource.type === 'edx') && 
                                renderCoursePlatformLink(resource)
                            }
                            {resource.type === 'link' && renderGeneralLink(resource)}
                        </div>
                    ))}
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Resource Integration Tips</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• YouTube videos are automatically validated and embedded</li>
                    <li>• Course platform links are verified for correct domains</li>
                    <li>• All URLs are checked for validity before adding</li>
                    <li>• Resources are saved with your learning module</li>
                </ul>
            </div>
        </div>
    );
};

export default ResourceIntegration;