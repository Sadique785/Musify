import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../../axios/authInterceptor';
import toast from 'react-hot-toast';

function ReportModal({ isOpen, onClose, userEmail, postId }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [selectedOption, setSelectedOption] = useState('');
    const [isOtherOptionSelected, setIsOtherOptionSelected] = useState(false);

    if (!isOpen) return null;

    const handleOptionChange = (option) => {
        setSelectedOption(option);
        setIsOtherOptionSelected(option === 'Other');
    };

    const onSubmit = async (data) => {
        try {

            const reason = isOtherOptionSelected ? 'Other' : selectedOption;
            const description = isOtherOptionSelected ? data.description : '';
            const payload = {
                post_id: postId,
                email: userEmail,
                report_reason: reason,
                report_description: description, // Only send description if 'Other' is selected
            };

            const response = await axiosInstance.post('/content/report-post/', payload);
            toast.success('Report submitted successfully');
            handleClose();
        } catch (error) {
            toast.error('Error submitting report');
        }
    };

    const handleClose = () => {
        reset(); // Reset form fields
        setIsOtherOptionSelected(false);
        setSelectedOption('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="flex items-center justify-center">
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Report Post</h2>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    {!isOtherOptionSelected ? (
                        <>
                            <p className="text-gray-700 mb-4 mt-3">
                                Please let us know why you are reporting this post.
                            </p>
                            <div className="space-y-2 text-black font-medium">
                                {["Spam", "Harassment or bullying", "Violence", "Self-Injury", "Nudity or pornography", "Hate speech", "Copyright infringement (Google Form)", "Other"].map((option) => (
                                    <div key={option} className="flex bg-gray-100 p-3 rounded-lg items-center space-x-2">
                                        <input 
                                            type="radio" 
                                            id={option} 
                                            name="reportReason" 
                                            checked={selectedOption === option} 
                                            onChange={() => handleOptionChange(option)}
                                            className="text-gray-300" 
                                        />
                                        <label htmlFor={option}>{option}</label>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-700 mb-4">
                                Please provide more details about your report.
                            </p>
                            <div className="mb-4">
                                <label className="text-gray-700 font-medium" htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={userEmail} 
                                    readOnly 
                                    className="w-full mt-1 p-2 border border-gray-300 text-gray-400 rounded-md" 
                                />
                            </div>
                            <div className="mb-4">
                                <label className="text-gray-700 font-medium" htmlFor="description">Description</label>
                                <textarea 
                                    id="description" 
                                    placeholder="Provide as much detail as possible, including links to verify your report." 
                                    {...register('description', {
                                        required: "Description is required",
                                        minLength: { value: 10, message: "Description must be at least 10 characters" }
                                    })}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportModal;
