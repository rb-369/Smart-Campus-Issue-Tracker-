import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueApi, uploadApi } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineDocumentText,
    HiOutlineMapPin,
    HiOutlineFlag,
    HiOutlinePhoto,
    HiOutlineXMark
} from 'react-icons/hi2';
import './ReportIssue.css';

const ReportIssue = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'infrastructure',
        priority: 'medium',
        location: {
            building: '',
            floor: '',
            room: '',
            description: ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const locationField = name.split('.')[1];
            setFormData({
                ...formData,
                location: { ...formData.location, [locationField]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setUploadingImages(true);

        try {
            const uploadPromises = files.map(async (file) => {
                const response = await uploadApi.uploadImage(file);
                return response.data;
            });

            const uploadedImages = await Promise.all(uploadPromises);
            setImages([...images, ...uploadedImages]);
            toast.success(`${files.length} image(s) uploaded successfully`);
        } catch (error) {
            toast.error('Failed to upload images');
            console.error('Upload error:', error);
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.location.building) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const issueData = {
                ...formData,
                images: images.map(img => img.url)
            };
            await issueApi.create(issueData);
            toast.success('Issue reported successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { value: 'infrastructure', label: '🔧 Infrastructure', desc: 'Benches, lights, doors' },
        { value: 'cleanliness', label: '✨ Cleanliness', desc: 'Washrooms, corridors' },
        { value: 'network', label: '📡 Network/IT', desc: 'Wi-Fi, computers' },
        { value: 'equipment', label: '⚙️ Equipment', desc: 'Lab, classroom equipment' },
        { value: 'other', label: '📋 Other', desc: 'Other issues' }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'gray' },
        { value: 'medium', label: 'Medium', color: 'info' },
        { value: 'high', label: 'High', color: 'warning' },
        { value: 'urgent', label: 'Urgent', color: 'danger' }
    ];

    return (
        <div className="page report-issue">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Report an Issue</h1>
                    <p className="page-subtitle">Help us improve campus facilities by reporting problems</p>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    {/* Issue Details */}
                    <div className="form-section">
                        <div className="section-icon">
                            <HiOutlineDocumentText />
                        </div>
                        <div className="section-content">
                            <h2>Issue Details</h2>

                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Brief title describing the issue"
                                    className="form-input"
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Detailed description of the problem. Include when you noticed it and any relevant details."
                                    className="form-textarea"
                                    rows={4}
                                    maxLength={1000}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <div className="category-grid">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat.value}
                                            className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.value}
                                                checked={formData.category === cat.value}
                                                onChange={handleChange}
                                            />
                                            <span className="category-label">{cat.label}</span>
                                            <span className="category-desc">{cat.desc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="form-section">
                        <div className="section-icon">
                            <HiOutlinePhoto />
                        </div>
                        <div className="section-content">
                            <h2>Images (Optional)</h2>
                            <p className="section-subtitle">Upload up to 5 images to help describe the issue</p>

                            <div className="image-upload-area">
                                <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploadingImages || images.length >= 5}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`upload-button ${uploadingImages ? 'uploading' : ''} ${images.length >= 5 ? 'disabled' : ''}`}
                                >
                                    {uploadingImages ? (
                                        <>
                                            <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlinePhoto size={24} />
                                            Click to upload images
                                        </>
                                    )}
                                </label>

                                {images.length > 0 && (
                                    <div className="uploaded-images">
                                        {images.map((img, index) => (
                                            <div key={index} className="image-preview">
                                                <img src={img.url} alt={`Upload ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <HiOutlineXMark />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-section">
                        <div className="section-icon">
                            <HiOutlineMapPin />
                        </div>
                        <div className="section-content">
                            <h2>Location</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Building *</label>
                                    <input
                                        type="text"
                                        name="location.building"
                                        value={formData.location.building}
                                        onChange={handleChange}
                                        placeholder="e.g., Main Block"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Floor</label>
                                    <input
                                        type="text"
                                        name="location.floor"
                                        value={formData.location.floor}
                                        onChange={handleChange}
                                        placeholder="e.g., Ground Floor"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Room/Area</label>
                                    <input
                                        type="text"
                                        name="location.room"
                                        value={formData.location.room}
                                        onChange={handleChange}
                                        placeholder="e.g., Room 101"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Additional Details</label>
                                    <input
                                        type="text"
                                        name="location.description"
                                        value={formData.location.description}
                                        onChange={handleChange}
                                        placeholder="e.g., Near the entrance"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="form-section">
                        <div className="section-icon">
                            <HiOutlineFlag />
                        </div>
                        <div className="section-content">
                            <h2>Priority Level</h2>

                            <div className="priority-grid">
                                {priorities.map((p) => (
                                    <label
                                        key={p.value}
                                        className={`priority-option priority-${p.color} ${formData.priority === p.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={p.value}
                                            checked={formData.priority === p.value}
                                            onChange={handleChange}
                                        />
                                        <span>{p.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || uploadingImages}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" style={{ width: '18px', height: '18px' }}></span>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Issue'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;

