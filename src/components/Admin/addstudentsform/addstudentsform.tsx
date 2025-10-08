import React, { useState, useEffect } from "react";
import axios from "axios";
import "./adduserform.css";
import { FaArrowLeft, FaUpload, FaCheckCircle } from "react-icons/fa";
import { Form, Input, Button, Select, DatePicker, Radio, message } from "antd";
import dayjs from "dayjs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Gender = "MALE" | "FEMALE";

type StudentRegisterRequest = {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
  batchId: number;
  gender: Gender;
  dateOfBirth: string;
  address: {
    lane1: string;
    lane2?: string;
    city: string;
    district: string;
    postalCode: string;
  };
};

interface AddStudentFormProps {
  mode: 'create' | 'view' | 'edit';
  studentId?: number;
  onClose: () => void;
  onCreate?: (student: StudentRegisterRequest) => void;
  onUpdate?: () => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ mode, studentId, onClose, onCreate, onUpdate }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [batchOptions, setBatchOptions] = useState<{ label: string; value: number }[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [departmentSelectionOptions, setDepartmentSelectionOptions] = useState<{ label: string; value: number }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      messageApi.error("You are not authenticated");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchDropdownData = async () => {
      try {
        setLoadingBatches(true);
        setLoadingDepartments(true);

        const [batchRes, deptRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/v1/batches/GetAll`, { headers }),
          axios.get(`${API_BASE_URL}/v1/departments/GetAll`, { headers }),
        ]);

        const batches = Array.isArray(batchRes.data?.data) ? batchRes.data.data : [];
        const departments = Array.isArray(deptRes.data?.data) ? deptRes.data.data : [];

        setBatchOptions(
          batches.map((b: any) => ({ label: b.name, value: b.id }))
        );
        setDepartmentSelectionOptions(
          departments.map((d: any) => ({ label: d.departmentName, value: d.departmentId }))
        );
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
        setBatchOptions([]);
        setDepartmentSelectionOptions([]);
      } finally {
        setLoadingBatches(false);
        setLoadingDepartments(false);
      }
    };

    fetchDropdownData();
  }, [messageApi]);

  useEffect(() => {
    if (mode !== 'view' || !studentId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      messageApi.error("You are not authenticated");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/v1/students/${studentId}`, { headers });
        const s = res?.data?.data;
        if (!s) return messageApi.error("Student not found");

        form.setFieldsValue({
          firstName: s.firstName,
          lastName: s.lastName,
          registrationNumber: s.registrationNumber,
          email: s.email,
          phoneNumber: s.phoneNumber,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth ? dayjs(s.dateOfBirth, "YYYY-MM-DD") : undefined,
          departmentId: s.department?.departmentId,
          batchId: s.batch?.id,
          studentStatus: s.studentStatus,
          address: {
            lane1: s.address?.lane1,
            lane2: s.address?.lane2,
            city: s.address?.city,
            district: s.address?.district,
            postalCode: s.address?.postalCode,
          },
        });
      } catch (e: any) {
        messageApi.error(e?.response?.data?.message || "Failed to retrieve student");
      }
    };

    fetchStudent();
  }, [mode, studentId, form, messageApi]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsUploaded(false);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploaded(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // const handleFinish = async (values: any) => {
  //   if (mode !== 'create') return;

  //   const payload: StudentRegisterRequest = {
  //     firstName: values.firstName,
  //     lastName: values.lastName,
  //     registrationNumber: values.registrationNumber,
  //     email: values.email,
  //     phoneNumber: values.phoneNumber,
  //     departmentId: values.departmentId,
  //     batchId: values.batchId,
  //     gender: values.gender,
  //     dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "",
  //     address: values.address,
  //   };


  //   if (!token) return messageApi.error("You are not authenticated");

  //   try {
  //     setSubmitting(true);
  //     await axios.post(`${API_BASE_URL}/v1/students`, payload, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     messageApi.success("Student registered successfully");
  //     form.resetFields();
  //     onCreate?.(payload);
  //   } catch (err: any) {
  //     const msg = err?.response?.data?.message || err?.message || "Failed to register student";
  //     messageApi.error(msg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  type StudentUpdateRequest = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    departmentId: number;
    gender: Gender;
    dateOfBirth: string; // YYYY-MM-DD
  };

  const handleFinish = async (values: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    messageApi.error("You are not authenticated");
    return;
  }

  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  // Log for debugging
  console.log("Submitting student:", { mode, studentId, values });

  // Build payload based on mode
  const payload: StudentRegisterRequest | StudentUpdateRequest = isCreate
    ? {
        firstName: values.firstName,
        lastName: values.lastName,
        registrationNumber: values.registrationNumber,
        email: values.email,
        phoneNumber: values.phoneNumber,
        departmentId: values.departmentId,
        batchId: values.batchId,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD") || "",
        address: values.address,
      }
    : {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        departmentId: values.departmentId,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD") || "",
      };

  try {
    setSubmitting(true);

    if (isCreate) {
      await axios.post(`${API_BASE_URL}/v1/students`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      form.resetFields();
      onCreate?.(payload as StudentRegisterRequest);
      messageApi.success("Student registered successfully");
    } else if (isEdit && studentId) {
      await axios.put(`${API_BASE_URL}/v1/students/${studentId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messageApi.success("Student updated successfully");
      onUpdate?.();
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "Operation failed";
    messageApi.error(msg);
  } finally {
    setSubmitting(false);
  }
};



  return <div>{contextHolder}{
    <div className="dashboard-cards">
      {contextHolder}
      <div className="add-user-form-container">
        {/* Header */}
        <div className="add-user-form-header">
          <button type="button" className="add-user-back-btn" onClick={onClose} aria-label="Back">
            <FaArrowLeft className="add-user-back-icon" />
          </button>
          <span className="add-user-title">Add Student</span>
        </div>

        {/* File Upload */}
        <div className="add-user-file-section">
          <label className="add-user-label">Select File (Excel File)</label>
          <div className="add-user-file-container">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="add-user-file-input"
              id="excelFileInput"
            />
            <label htmlFor="excelFileInput" className="add-user-file-btn">
              <span>Add file</span>
              <FaUpload className="add-user-upload-icon" />
            </label>
          </div>

          {file && (
            <div className="file-progress-container">
              <span className="file-name">{file.name}</span>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>

              <span className="progress-text">{uploadProgress}%</span>
              {isUploaded && <FaCheckCircle className="success-icon" />}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="add-user-divider">
          <span className="add-user-divider-title">Add manually</span>
        </div>

        {/* Student Registration Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark="optional"
          className="add-user-form-grid"
          disabled={mode === 'view'}
        >
          <div className="add-user-two-col">
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input placeholder="First name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </div>

          <div className="add-user-two-col">
            <Form.Item
              label="Registration Number"
              name="registrationNumber"
              rules={[{ required: true, message: "Please enter registration number" }]}
            >
              <Input placeholder="eg: EG/20XX/XXXX" disabled={mode !== 'create'} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input placeholder="name@example.com" />
            </Form.Item>
          </div>

          <div className="add-user-two-col">
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input placeholder="07XXXXXXXX" />
            </Form.Item>

            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <Radio.Group>
                <Radio value="MALE">Male</Radio>
                <Radio value="FEMALE">Female</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <div className="add-user-two-col">
            <Form.Item
              label="Department"
              name="departmentId"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select options={departmentSelectionOptions} placeholder="Select department" allowClear />
            </Form.Item>

            <Form.Item
              label="Batch"
              name="batchId"
              rules={[{ required: true, message: "Please select batch" }]}
            >
              <Select
                options={batchOptions}
                loading={loadingBatches}
                placeholder="Select batch"
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Date of Birth"
            name="dateOfBirth"
            rules={[{ required: true, message: "Please select date of birth" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={(d) => d && d.isAfter(dayjs())} />
          </Form.Item>

          <div className="add-user-divider small-gap">
            <span className="add-user-divider-title">Address</span>
          </div>

          <Form.Item
            label="Lane 1"
            name={["address", "lane1"]}
            rules={[{ required: true, message: "Please enter lane 1" }]}
          >
            <Input placeholder="No. 123, Main Street" />
          </Form.Item>

          <Form.Item label="Lane 2" name={["address", "lane2"]}>
            <Input placeholder="Apartment / Suite / Optional" />
          </Form.Item>

          <div className="add-user-three-col">
            <Form.Item
              label="City"
              name={["address", "city"]}
              rules={[{ required: true, message: "Please enter city" }]}
            >
              <Input placeholder="City" />
            </Form.Item>

            <Form.Item
              label="District"
              name={["address", "district"]}
              rules={[{ required: true, message: "Please enter district" }]}
            >
              <Input placeholder="District" />
            </Form.Item>

            <Form.Item
              label="Postal Code"
              name={["address", "postalCode"]}
              rules={[{ required: true, message: "Please enter postal code" }]}
            >
              <Input placeholder="Postal code" />
            </Form.Item>

            {mode === 'view' && (
              <Form.Item label="Status" name="studentStatus">
                <Input disabled />
              </Form.Item>
            )}
          </div>
        </Form>

        {/* Actions */}
        <div className="add-user-form-actions">
          {mode === 'view' ? null :
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={submitting}
              className="add-user-create-btn"
            >
              Create
            </Button>
          }

          <Button onClick={onClose} className="add-user-cancel-btn">
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  }</div>;
};

export default AddStudentForm;
