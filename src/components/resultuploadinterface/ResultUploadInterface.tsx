import React, { useState } from 'react';
import { FaFileExcel, FaFile, FaFolder, FaDownload } from 'react-icons/fa';
import './ResultUploadInterface.css';

interface ResultUploadInterfaceProps {
    course: { code: string; title: string };
    onBack: () => void;
    onFileUpload: (name: string) => void;
}

const ResultUploadInterface: React.FC<ResultUploadInterfaceProps> = ({ course, onBack, onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            onFileUpload(file.name); // Pass the file name to parent component
        }
    };

    return (
        <div className="result-upload-container">
            <div className="header-section">
                <h3 className="dragdrophead">Add Results: {course.code} - {course.title}</h3>
                <hr />
            </div>

            <div className="upload-tabs">
                <button className="tab-btnCA active">Continuous Assessment</button>
                <button className="tab-btnCA">Final Exam</button>
            </div>

            <div className='Uploadarea'>
                <div className="file-info-header">
                    Maximum file size: 20 MB, maximum number of files: 1
                </div>

                <div className="upload-box">
                    <div className="upload-box-icons">
                        <button className="icon-btn"><FaFile /></button>
                        <button className="icon-btn"><FaFolder /></button>
                        <button className="icon-btn"><FaDownload /></button>
                    </div>

                    {!selectedFile ? (
                        <>
                            <FaFileExcel className="custom-icon-uploadinterface"/>
                            <p className='choosefileP'>Choose a file or Drag and Drop it Here</p>
                            <div className="upload-text-group">
                                <small>CSV file format</small>
                                <label htmlFor="fileUpload" className="upload-btn">
                                    Browse File
                                </label>
                            </div>

                            <input
                                type="file"
                                id="fileUpload"
                                className="file-input"
                                onChange={handleFileSelect}
                                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                hidden
                            />
                        </>
                    ) : (
                        <div className="file-preview">
                            <FaFileExcel  className="custom-icon-uploadinterface" />
                            <span className="file-name-uploadsection">{selectedFile.name}</span>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button className="save-btn" onClick={onBack}>Save Changes</button>
                    <button className="cancel-btn" onClick={onBack}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ResultUploadInterface;
