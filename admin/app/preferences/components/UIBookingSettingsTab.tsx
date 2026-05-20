'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LuArrowRightLeft } from 'react-icons/lu';
import { BiSolidShip } from 'react-icons/bi';
import { HiUsers } from 'react-icons/hi2';
import { IoMdPin } from 'react-icons/io';
import { GrCar } from 'react-icons/gr';
import { FaShip, FaPhoneAlt } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { PiInfo } from 'react-icons/pi';
import { FiLoader } from 'react-icons/fi';
import axios from 'axios';
import {
  Select,
  Button,
  Radio,
  Upload,
  message,
  Input,
  Typography,
  Switch,
  ColorPicker,
  Form,
  Card,
  DatePicker,
  Space,
} from 'antd';
import {
  SettingOutlined,
  EyeOutlined,
  UploadOutlined,
  DeleteOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useWatch } from 'antd/es/form/Form';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';
import type { UploadFile } from 'antd/es/upload/interface';
import { v4 as uuidv4 } from 'uuid';
import {
  IThumbnail,
  IAboutUs,
  IContactUs,
  IHeaderSection,
  IHeroSection,
  IFooterSection,
  IThemeSettings,
} from '@ayahay/models';
import { uploadToS3, deleteFileFromS3 } from '@/app/utils/s3-storage.service';
import FaqTable, { FaqTableRef } from './FaqTable';
import PressTable, { PressTableRef } from './PressTable';
import PrivacyPolicyTable, {
  PrivacyPolicyTableRef,
} from './PrivacyPolicyTable';

const { TextArea } = Input;
const { Text } = Typography;

const categoryPressOptions = ['Research', 'Partnerships', 'Milestones'];
const typePressOptions = ['Video', 'Article'];

const { Option } = Select;
const sections = [
  { value: 'thumbnails', label: 'Thumbnails' },
  { value: 'about_us', label: 'About Us' },
  { value: 'contact_us', label: 'Contact Us' },
  { value: 'faq', label: 'FAQ' },
  { value: 'press', label: 'Press' },
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'header_section', label: 'Header Section' },
  { value: 'hero_section', label: 'Hero Section' },
  { value: 'footer_section', label: 'Footer Section' },
  { value: 'theme_settings', label: 'Theme Settings' },
];

interface EditableThumbnailLabelProps {
  label: string;
  onSave: (newLabel: string) => void;
}

const EditableThumbnailLabel: React.FC<EditableThumbnailLabelProps> = ({
  label,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(label);

  const handleThumbnailEditClick = () => setIsEditing(true);

  const handleThumbnailSaveClick = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  const handleThumbnailCancelClick = () => {
    setInputValue(label);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: 120, marginRight: 6 }}
          />
          <Button
            type='primary'
            icon={<SaveOutlined />}
            onClick={handleThumbnailSaveClick}
            style={{ marginRight: 2 }}
          />
          <Button
            type='default'
            icon={<CloseOutlined />}
            onClick={handleThumbnailCancelClick}
            style={{ marginLeft: 2 }}
          />
        </>
      ) : (
        <>
          <label>{label}</label>
          <Button
            type='link'
            icon={<EditOutlined />}
            onClick={handleThumbnailEditClick}
          />
        </>
      )}
    </div>
  );
};

export default function UIBookingSettings() {
  const [selectedSection, setSelectedSection] = useState(sections[0].value);
  const [thumbnailType, setThumbnailType] = useState('carousel');
  const [userData, setUserData] = useState<any>(null);
  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
  const [aboutUs, setAboutUs] = useState<IAboutUs | null>(null);
  const [contactUs, setContactUs] = useState<IContactUs | null>(null);
  const [headerSection, setHeaderSection] = useState<IHeaderSection | null>(
    null
  );
  const [heroSection, setHeroSection] = useState<IHeroSection | null>(null);
  const [footerSection, setFooterSection] = useState<IFooterSection>({
    id: 0,
    shippingLineId: 0,
    hasAboutUs: false,
    hasPress: false,
    hasFaq: false,
    hasPrivacyPolicy: false,
    hasTermsAndConditions: false,
    primaryContactNumber: '',
    primaryContactNumberNetwork: '',
    secondaryContactNumber: '',
    secondaryContactNumberNetwork: '',
    email: '',
    twitterUrl: '',
    facebookUrl: '',
    linkedInUrl: '',
    instagramUrl: '',
  });
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [backgroundType, setBackgroundType] = useState('image');
  const [colorTheme, setColorTheme] = useState('background');
  const [coreValues, setCoreValues] = useState<any[]>([]);
  const fileInputs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [faqCategory, setFaqCategory] = useState('Booking & Reservations');
  const [faqForm] = Form.useForm();
  const tableFaqRef = useRef<FaqTableRef>(null);
  const [pressForm] = Form.useForm();
  const tablePressRef = useRef<PressTableRef>(null);
  const selectedPressType = useWatch('type', pressForm);
  const [privacyPolicyForm] = Form.useForm();
  const tablePrivacyPolicyRef = useRef<PrivacyPolicyTableRef>(null);
  const selectedPrivacyPolicyTitle = Form.useWatch('title', privacyPolicyForm);
  const [usedPrivacyPolicyTitleIds, setUsedPrivacyPolicyTitleIds] = useState<
    string[]
  >([]);

  const defaultCoreValues = [
    {
      title: 'Innovation',
      description: 'Constantly pushing boundaries in logistics technology',
      icon: 'Lightbulb',
      color: '#eab308',
    },
    {
      title: 'Reliability',
      description: 'Delivering consistent and dependable solutions',
      icon: 'Shield',
      color: '#22c55e',
    },
    {
      title: 'Customer-Centric',
      description: 'Focusing on the unique needs of our clients',
      icon: 'Users',
      color: '#4299e1',
    },
  ];

  const fontOptions = [
    { label: 'Josh', value: 'josh' },
    { label: 'Roboto', value: 'roboto' },
    { label: 'League Spartan', value: 'leagueSpartan' },
    { label: 'Mountains Of Christmas', value: 'mountainsOfChristmas' },
    { label: 'Great Vibes', value: 'greatVibes' },
    { label: 'Henny Penny', value: 'hennyPenny' },
    { label: 'Rubik Gemstones', value: 'rubikGemstones' },
  ];

  const colorOptions = [
    { label: 'Background', value: 'background' },
    { label: 'Border', value: 'border' },
    { label: 'Button', value: 'button' },
    { label: 'Icon', value: 'icon' },
  ];

  const faqCategoryOptions = [
    { label: 'Booking & Reservations', value: 'Booking & Reservations' },
    { label: 'Travel Information', value: 'Travel Information' },
    { label: 'Safety & Security', value: 'Safety & Security' },
    { label: 'Schedule & Routes', value: 'Schedule & Routes' },
    { label: 'On-board Experience', value: 'On-board Experience' },
    { label: 'Cancellations & Refunds ', value: 'Cancellations & Refunds' },
  ];

  const privacyPolicyTitleOptions = [
    { label: 'Privacy Policy', value: 'introduction' },
    { label: '1. Information We Collect', value: 'information-we-collect' },
    {
      label: '2. How We Use Your Information',
      value: 'how-we-use-your-information',
    },
    { label: '3. Sharing Your Information', value: 'sharing-your-information' },
    { label: '4. Security', value: 'security' },
    { label: '5. Your Choices', value: 'your-choices' },
    { label: "6. Children's Privacy", value: 'childrens-privacy' },
    { label: '7. Updates to this Privacy Policy', value: 'updates-to-policy' },
    { label: '8. Contact Us', value: 'contact-us' },
  ];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const S3_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;

  const toTitleCase = (str: string): string => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const extractYouTubeID = (url: string): string => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const getAcceptType = () => {
    return backgroundType === 'image' ? 'image/*' : 'video/*';
  };

  useEffect(() => {
    const loginUser = JSON.parse(
      localStorage.getItem('logged-in-account') || '{}'
    );
    setUserData(loginUser?.data || null);
  }, []);

  useEffect(() => {
    if (userData?.shippingLineId) {
      if (selectedSection === 'thumbnails') {
        fetchThumbnails(userData?.shippingLineId);
      }

      if (selectedSection === 'about_us') {
        fetchAboutUs(userData?.shippingLineId);
      }

      if (selectedSection === 'contact_us') {
        fetchContactUs(userData?.shippingLineId);
      }

      if (selectedSection === 'privacy_policy') {
        fetchUsedPrivacyPolicyTitles(userData?.shippingLineId);
      }

      if (selectedSection === 'header_section') {
        fetchHeaderSection(userData?.shippingLineId);
      }

      if (selectedSection === 'hero_section') {
        fetchHeroSection(userData?.shippingLineId);
      }

      if (selectedSection === 'footer_section') {
        fetchFooterSection(userData?.shippingLineId);
      }

      if (selectedSection === 'theme_settings') {
        fetchThemeSettings(userData?.shippingLineId);
      }
    }
  }, [selectedSection, userData]);

  const fetchThumbnails = async (shippingLineId: number) => {
    setLoading(true);

    try {
      const response = await axios.get<IThumbnail[]>(
        `${API_URL}/thumbnails/${thumbnailType}/${shippingLineId}`
      );
      setThumbnails(response.data);
    } catch (error) {
      console.error('Error fetching thumbnails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAboutUs = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const response = await axios.get<IAboutUs>(
        `${API_URL}/about-us/${shippingLineId}`
      );

      // Parse `ourCoreValues` (which is stored as a string in DB)
      const parsedCoreValues = response.data.ourCoreValues
        ? JSON.parse(response.data.ourCoreValues)
        : defaultCoreValues;

      setAboutUs({
        ...response.data,
        imageLabel: 'About Us Image',
        ourCoreValues: parsedCoreValues, // Now stored as an array in state
      });

      setCoreValues(parsedCoreValues);
    } catch (error) {
      console.error('Error fetching about us:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactUs = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const response = await axios.get<IContactUs>(
        `${API_URL}/contact-us/${shippingLineId}`
      );

      setContactUs(response.data);
    } catch (error) {
      console.error('Error fetching contact us:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeaderSection = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const response = await axios.get<IHeaderSection>(
        `${API_URL}/header-section/${shippingLineId}`
      );

      setHeaderSection({
        ...response.data,
      });
    } catch (error) {
      console.error('Error fetching header section:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroSection = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const response = await axios.get<IHeroSection>(
        `${API_URL}/hero-section/${shippingLineId}`
      );

      setHeroSection({
        ...response.data,
        label: 'Hero Setion Image',
      });
    } catch (error) {
      console.error('Error fetching hero section:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFooterSection = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const response = await axios.get<IFooterSection>(
        `${API_URL}/footer-section/${shippingLineId}`
      );
      console.log(response.data);
      setFooterSection(response.data);
    } catch (error) {
      console.error('Error fetching footer section:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThemeSettings = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const response = await axios.get<IThemeSettings>(
        `${API_URL}/theme-settings/${shippingLineId}`
      );
      setThemeSettings(response.data);
    } catch (error) {
      console.error('Error fetching theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsedPrivacyPolicyTitles = async (shippingLineId: number) => {
    const res = await axios.get(`${API_URL}/privacy-policy/${shippingLineId}`);
    const existing = Array.isArray(res.data) ? res.data : [];
    setUsedPrivacyPolicyTitleIds(existing.map((item) => item.titleId));
  };

  const handleHeaderSectionToggleChange = (key: any) => (checked: any) => {
    setHeaderSection((prev: any) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleFooterSectionToggleChange = (key: any) => (checked: any) => {
    setFooterSection((prev: any) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleThumbnailEditClick = (thumbnailId: number) => {
    if (fileInputs.current[thumbnailId]) {
      fileInputs.current[thumbnailId]!.click();
    }
  };

  const handleUpload = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const beforeUpload = (file: { type: string }) => {
    const isImage = file.type.startsWith('image');
    const isVideo = file.type.startsWith('video');

    if (selectedSection === 'hero_section') {
      // Allow images and videos in `hero_section`, but only if backgroundType is correct
      if (backgroundType === 'image' && !isImage) {
        message.error('Only image files are allowed!');
        return Upload.LIST_IGNORE;
      }
      if (backgroundType === 'video' && !isVideo) {
        message.error('Only video files are allowed!');
        return Upload.LIST_IGNORE;
      }
    } else {
      // Other sections: Allow only images
      if (!isImage) {
        message.error('Only image files are allowed!');
        return Upload.LIST_IGNORE;
      }
    }

    return false;
  };

  const handleThumbnailClearImages = () => {
    setFileList([]);
    message.success('All images cleared!');
  };

  const handleThumbnailDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setThumbnails((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(prev, oldIndex, newIndex).map(
          (item, idx) => ({
            ...item,
            imageOrder: idx + 1,
          })
        );

        // Update the database with new order
        updateThumbnailOrder(newOrder);
        return newOrder;
      });
    }
  };

  const updateThumbnailOrder = async (thumbnails: IThumbnail[]) => {
    try {
      await Promise.all(
        thumbnails.map(async (thumbnail) => {
          const response = await axios.put(
            `${API_URL}/thumbnails/${thumbnail.id}`,
            {
              id: thumbnail.id,
              imageOrder: thumbnail.imageOrder,
            },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (response.status !== 200 && response.status !== 201) {
            console.error(`Server error: ${response.status}`);
          }
        })
      );

      // Refresh thumbnails after upload
      fetchThumbnails(userData?.shippingLineId);
    } catch (error) {
      console.error('Error updating thumbnail order:', error);
      message.error('Failed to update thumbnail order.');
    }
  };

  const handleThumbnailFilesUpload = async () => {
    setLoading(true);
    if (!fileList || fileList.length === 0) return;

    try {
      await Promise.all(
        fileList.map(async (file) => {
          try {
            if (!file.originFileObj) {
              throw new Error('Missing original file object');
            }

            // Convert File to Buffer
            const fileArrayBuffer = await file.originFileObj.arrayBuffer();
            const fileBuffer = Buffer.from(fileArrayBuffer);
            const filename = uuidv4();

            // Get index for ordering
            const index = fileList.indexOf(file);

            // Define thumbnail object
            const thumbnail: IThumbnail = {
              id: 0,
              shippingLineId: userData?.shippingLineId,
              label: `${toTitleCase(thumbnailType)} ${
                thumbnails.length + (index + 1)
              }`,
              filename: filename,
              location: toTitleCase(thumbnailType),
              imageOrder: thumbnails.length + (index + 1),
            };

            // Add Thumbnail
            const response = await axios.post(
              `${API_URL}/thumbnails`,
              thumbnail,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.status !== 200 && response.status !== 201) {
              console.error(`Server error: ${response.status}`);
              return;
            } else {
              // Upload to S3
              await uploadToS3(
                fileBuffer,
                file.originFileObj.type,
                thumbnailType.toLowerCase(),
                userData?.shippingLineId,
                filename
              );
            }
          } catch (error: any) {
            console.error(`Upload failed: ${error.message}`);
          }
        })
      );

      // Refresh thumbnails and clear images after upload
      setFileList([]);
      fetchThumbnails(userData?.shippingLineId);

      message.success(
        `Successfully uploaded: ${fileList.length} file${
          fileList.length > 1 ? 's' : ''
        }`
      );
    } catch (error: any) {
      console.error('Error during batch upload:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpdateFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    thumbnail: IThumbnail
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert File to Buffer
    const fileArrayBuffer = await file.arrayBuffer(); // Convert to ArrayBuffer
    const fileBuffer = Buffer.from(fileArrayBuffer); // Convert to Buffer

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('thumbnail', JSON.stringify(thumbnail)); // Send as plain JSON string

    try {
      await uploadToS3(
        fileBuffer,
        file.type,
        thumbnail?.location ?? '',
        thumbnail?.shippingLineId?.toString() ?? '',
        thumbnail?.filename ?? ''
      );

      // Refresh thumbnails after upload
      fetchThumbnails(userData?.shippingLineId);

      message.success(`Successfully uploaded: ${file.name}`);
    } catch (error: any) {
      console.error('Upload failed:', error.message);
    }
  };

  const handleThumbnailSaveLabel = async (id: number, newLabel: string) => {
    try {
      // Define thumbnail object
      const thumbnail: IThumbnail = {
        id: id,
        label: newLabel,
      };

      // Update Thumbnail Label
      const response = await axios.put(
        `${API_URL}/thumbnails/${thumbnail.id}`,
        thumbnail,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Check for unsuccessful responses
      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      }

      // Refresh thumbnails after upload
      fetchThumbnails(userData?.shippingLineId);

      message.success('Thumbnail label updated successfully.');
    } catch (error: any) {
      console.error(
        'Error updating thumbnail label:',
        error.response?.data || error.message
      );
    }
  };

  const handleThumbnailRemoveImage = async (id: number, filename: string) => {
    try {
      // Update Thumbnail Label
      const response = await axios.delete(`${API_URL}/thumbnails/${id}`);

      // Check for unsuccessful responses
      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
      } else {
        // Delete to S3
        await deleteFileFromS3(
          thumbnailType.toLowerCase(),
          filename,
          userData?.shippingLineId
        );
      }

      // Refresh thumbnails after upload
      fetchThumbnails(userData?.shippingLineId);

      message.success('Thumbnail deleted successfully.');
    } catch (error: any) {
      console.error(
        'Error deleting thumbnail:',
        error.response?.data || error.message
      );
    }
  };

  const handleAboutUsInputChange = (
    field: keyof typeof aboutUs,
    value: string | number
  ) => {
    // If value is a string, replace "\n" with "<br />"
    const formattedValue =
      typeof value === 'string' ? value.replace(/\n/g, '<br />') : value;
    setAboutUs((prev: any) => ({ ...prev, [field]: formattedValue }));
  };

  const handleCoreValuesChange = (
    index: number,
    field: string,
    value: string
  ) => {
    // Ensure `coreValues` is an array before modifying
    if (!Array.isArray(coreValues)) {
      console.error('coreValues is not an array:', coreValues);
      return;
    }

    // Update the local coreValues state
    const updatedCoreValues = [...coreValues];
    updatedCoreValues[index][field] = value;

    // Update only `coreValues`, without modifying `aboutUs`
    setCoreValues(updatedCoreValues);
  };

  const handleContactUsInputChange = (
    field: keyof typeof contactUs,
    value: string | number
  ) => {
    // If value is a string, replace "\n" with "<br />"
    const formattedValue =
      typeof value === 'string' ? value.replace(/\n/g, '<br />') : value;
    setContactUs((prev: any) => ({ ...prev, [field]: formattedValue }));
  };

  const handleHeroSectionInputChange = (
    field: keyof typeof heroSection,
    value: string | number
  ) => {
    setHeroSection((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFooterSectionInputChange = (
    field: keyof typeof footerSection,
    value: string | number
  ) => {
    setFooterSection((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleThemeSettingsFontChange = (value: string) => {
    if (themeSettings) {
      setThemeSettings({ ...themeSettings, fontStyle: value });
    }
  };

  const handleThemeSettingsColorChange = (
    key: keyof IThemeSettings,
    value: string
  ) => {
    if (themeSettings) {
      setThemeSettings({ ...themeSettings, [key]: value });
    }
  };

  const handleFaqCategoryChange = (value: string) => {
    if (faqCategory) {
      setFaqCategory(value);
    }
  };

  const handleSaveAboutUs = async () => {
    setLoading(true);

    try {
      // Convert File to Buffer
      let file, fileBuffer, filename;
      if (fileList && fileList.length > 0) {
        file = fileList[0]?.originFileObj;
        fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
        filename = uuidv4();
      }

      // Save About Us
      const response = await axios.post(
        `${API_URL}/about-us/save`,
        {
          id: aboutUs?.id,
          shippingLineId: userData?.shippingLineId ?? aboutUs?.shippingLineId,
          imageFilename: filename ?? aboutUs?.imageFilename,
          imageLabel: aboutUs?.imageLabel,
          imageCaption: aboutUs?.imageCaption,
          welcomeTitle: aboutUs?.welcomeTitle,
          welcomeDescription: aboutUs?.welcomeDescription,
          ourStoryTitle: aboutUs?.ourStoryTitle,
          ourStoryDescription: aboutUs?.ourStoryDescription,
          ourExpertiseTitle: aboutUs?.ourExpertiseTitle,
          ourExpertiseDescription: aboutUs?.ourExpertiseDescription,
          ourCoreValues: JSON.stringify(coreValues),
          tabsBackgroundColor: aboutUs?.tabsBackgroundColor,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      } else {
        if (
          fileBuffer &&
          file &&
          file?.type &&
          selectedSection &&
          userData?.shippingLineId &&
          filename
        ) {
          // Upload to S3
          await uploadToS3(
            fileBuffer ?? Buffer.alloc(0),
            file?.type ?? '',
            selectedSection.toLowerCase(),
            userData?.shippingLineId,
            filename ?? ''
          );

          message.success(`Successfully uploaded image: ${filename}`);
        }
      }

      // Refresh About-Us and clear image
      setFileList([]);
      fetchAboutUs(userData?.shippingLineId);

      message.success('Successfully updated About Us details.');
    } catch (error: any) {
      console.error(
        'Error during upload:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContactUs = async () => {
    setLoading(true);

    try {
      // Convert File to Buffer
      let file, fileBuffer, filename;
      if (fileList && fileList.length > 0) {
        file = fileList[0]?.originFileObj;
        fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
        filename = uuidv4();
      }

      // Save Contact Us
      const response = await axios.post(
        `${API_URL}/contact-us/save`,
        {
          id: contactUs?.id,
          shippingLineId: userData?.shippingLineId ?? contactUs?.shippingLineId,
          backgroundImageFilename:
            filename ?? contactUs?.backgroundImageFilename,
          headingText: contactUs?.headingText,
          headingDescription: contactUs?.headingDescription,
          contactNumber: contactUs?.contactNumber,
          email: contactUs?.email,
          address: contactUs?.address,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      } else {
        if (
          fileBuffer &&
          file &&
          file?.type &&
          selectedSection &&
          userData?.shippingLineId &&
          filename
        ) {
          // Upload to S3
          await uploadToS3(
            fileBuffer ?? Buffer.alloc(0),
            file?.type ?? '',
            selectedSection.toLowerCase(),
            userData?.shippingLineId,
            filename ?? ''
          );

          message.success(`Successfully uploaded image: ${filename}`);
        }
      }

      // Refresh Contact-Us and clear image
      setFileList([]);
      fetchContactUs(userData?.shippingLineId);

      message.success('Successfully updated Contact Us details.');
    } catch (error: any) {
      console.error(
        'Error during upload:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeaderSection = async () => {
    setLoading(true);

    try {
      // Save Header Section
      const response = await axios.post(
        `${API_URL}/header-section/save`,
        {
          id: headerSection?.id,
          shippingLineId:
            userData?.shippingLineId ?? headerSection?.shippingLineId,
          showPromos: headerSection?.showPromos,
          showRoutes: headerSection?.showRoutes,
          showResources: headerSection?.showResources,
          showAboutUs: headerSection?.showAboutUs,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      }

      // Refresh Header-Section
      fetchHeaderSection(userData?.shippingLineId);

      message.success('Successfully updated Header Section details.');
    } catch (error: any) {
      console.error(
        'Error during saving:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeroSection = async () => {
    setLoading(true);

    try {
      // Convert File to Buffer
      let file, fileBuffer, filename;
      if (fileList && fileList.length > 0) {
        file = fileList[0]?.originFileObj;
        fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
        filename = uuidv4();
      }

      // Save Hero Section
      const response = await axios.post(
        `${API_URL}/hero-section/save`,
        {
          id: heroSection?.id,
          shippingLineId:
            userData?.shippingLineId ?? heroSection?.shippingLineId,
          filename: filename ?? heroSection?.filename,
          label: heroSection?.label,
          youtubeUrl: heroSection?.youtubeUrl,
          fileType: toTitleCase(backgroundType) ?? heroSection?.fileType,
          caption1: heroSection?.caption1,
          caption2: heroSection?.caption2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      } else {
        if (
          fileBuffer &&
          file &&
          file?.type &&
          selectedSection &&
          userData?.shippingLineId &&
          filename
        ) {
          // Upload to S3
          await uploadToS3(
            fileBuffer ?? Buffer.alloc(0),
            file?.type ?? '',
            selectedSection.toLowerCase(),
            userData?.shippingLineId,
            filename ?? ''
          );

          message.success(`Successfully uploaded image: ${filename}`);
        }
      }

      // Refresh Hero-Section and clear image
      setFileList([]);
      fetchHeroSection(userData?.shippingLineId);

      message.success('Successfully updated Hero Section details.');
    } catch (error: any) {
      console.error(
        'Error during upload:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFooterSection = async () => {
    setLoading(true);

    try {
      // Save Hero Section
      const response = await axios.post(
        `${API_URL}/footer-section/save`,
        {
          id: footerSection?.id,
          shippingLineId:
            userData?.shippingLineId ?? footerSection?.shippingLineId,
          hasAboutUs: footerSection?.hasAboutUs,
          hasPress: footerSection?.hasPress,
          hasFaq: footerSection?.hasFaq,
          hasPrivacyPolicy: footerSection?.hasPrivacyPolicy,
          hasTermsAndConditions: footerSection?.hasTermsAndConditions,
          primaryContactNumber: footerSection?.primaryContactNumber,
          primaryContactNumberNetwork:
            footerSection?.primaryContactNumberNetwork,
          secondaryContactNumber: footerSection?.secondaryContactNumber,
          secondaryContactNumberNetwork:
            footerSection?.secondaryContactNumberNetwork,
          email: footerSection?.email,
          twitterUrl: footerSection?.twitterUrl,
          facebookUrl: footerSection?.facebookUrl,
          linkedInUrl: footerSection?.linkedInUrl,
          instagramUrl: footerSection?.instagramUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      }

      // Refresh Footer-Section
      fetchHeroSection(userData?.shippingLineId);

      message.success('Successfully updated Footer Section details.');
    } catch (error: any) {
      console.error(
        'Error during saving:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThemeSettings = async () => {
    setLoading(true);

    try {
      // Save Theme Settings
      const response = await axios.post(
        `${API_URL}/theme-settings/save`,
        {
          id: themeSettings?.id,
          shippingLineId:
            userData?.shippingLineId ?? themeSettings?.shippingLineId,
          fontStyle: themeSettings?.fontStyle,
          backgroundColor: themeSettings?.backgroundColor,
          buttonDefaultColor: themeSettings?.buttonDefaultColor,
          buttonDestructiveColor: themeSettings?.buttonDestructiveColor,
          buttonOutlineColor: themeSettings?.buttonOutlineColor,
          buttonSecondaryColor: themeSettings?.buttonSecondaryColor,
          buttonGhostColor: themeSettings?.buttonGhostColor,
          buttonLinkColor: themeSettings?.buttonLinkColor,
          borderColor: themeSettings?.borderColor,
          iconColor: themeSettings?.iconColor,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        console.error(`Server error: ${response.status}`);
        return;
      }

      // Refresh Theme-Settings
      fetchHeroSection(userData?.shippingLineId);

      message.success('Successfully updated Theme Settings details.');
    } catch (error: any) {
      console.error(
        'Error during saving:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddFAQ = async () => {
    try {
      const values = await faqForm.validateFields();
      await axios.post(`${API_URL}/faq`, {
        ...values,
        category: faqCategory,
        shippingLineId: userData?.shippingLineId,
      });
      message.success('FAQ created');
      faqForm.resetFields();
      tableFaqRef.current?.refresh(); // trigger table reload
    } catch (err) {
      console.error(err);
      message.error('Failed to create FAQ');
    }
  };

  const handleAddPress = async () => {
    try {
      const values = await pressForm.validateFields();

      await axios.post(`${API_URL}/press`, {
        ...values,
        content: values.content.replace(/\n/g, '<br>'), // optional: format content
        shippingLineId: userData?.shippingLineId,
      });

      message.success('Press item created');
      pressForm.resetFields();
      tablePressRef.current?.refresh(); // trigger table reload
    } catch (err) {
      console.error(err);
      message.error('Failed to create press item');
    }
  };

  const handleAddPrivacyPolicy = async () => {
    try {
      const values = await privacyPolicyForm.validateFields();
      const selected = privacyPolicyTitleOptions.find(
        (opt) => opt.label === values.title
      );
      const isIntro = selected?.value === 'introduction';

      const payload = {
        titleId: selected?.value,
        title: values.title,
        shippingLineId: userData?.shippingLineId,
        content: isIntro
          ? [
              { type: 'paragraph', text: values.content1 },
              { type: 'paragraph', text: values.content2 },
            ]
          : values.content
              .split('\n')
              .filter((line: string) => line.trim() !== '')
              .map((text: any) => ({ type: 'paragraph', text })),
      };

      setLoading(true);
      await axios.post(`${API_URL}/privacy-policy`, payload);
      await fetchUsedPrivacyPolicyTitles(userData?.shippingLineId);
      message.success('Privacy policy added');
      privacyPolicyForm.resetFields();

      if (tablePrivacyPolicyRef.current) {
        tablePrivacyPolicyRef.current.refresh();
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to add privacy policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 24,
        gap: 24,
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {/* Settings Panel */}
      <div
        style={{
          width: '50%',
          minHeight: '80vh',
          padding: 30,
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
          background: '#ffffff',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <SettingOutlined /> UI Booking Settings
        </h2>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            Select Section
          </h3>
          <Select
            value={selectedSection}
            onChange={(value) => {
              setSelectedSection(value);
              setFileList([]);
            }}
            style={{ width: '100%', height: 40 }}
          >
            {sections.map((section) => (
              <Option key={section.value} value={section.value}>
                {section.label}
              </Option>
            ))}
          </Select>
        </div>
        {selectedSection === 'thumbnails' && (
          <div style={{ marginBottom: 16, display: 'inline' }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              Thumbnails
            </h3>

            <Radio.Group
              value={thumbnailType}
              onChange={(e) => {
                setThumbnailType(e.target.value);
                setFileList([]); // Clear fileList when thumbnailType changes
              }}
            >
              <Radio value='carousel'>Carousel</Radio>
              <Radio value='photogrid'>Photogrid</Radio>
            </Radio.Group>

            <div
              style={{
                marginTop: 16,
                position: 'relative',
                display: 'flex',
                alignItems: 'start',
              }}
            >
              <Upload
                multiple
                listType='picture'
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={beforeUpload}
                accept='image/*'
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={fileList.length === 0}
                onClick={handleThumbnailClearImages}
                style={{ position: 'absolute', top: 0, left: 160 }}
              >
                Clear Images
              </Button>

              <Button
                type='primary'
                style={{ position: 'absolute', top: 0, left: 307 }}
                disabled={fileList.length === 0}
                onClick={handleThumbnailFilesUpload}
                loading={loading}
              >
                Upload Images
              </Button>
            </div>
          </div>
        )}
        {selectedSection === 'about_us' && (
          <div style={{ marginBottom: 16, display: 'inline' }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              About Us
            </h3>

            {/* Image Upload */}
            <Text style={{ fontSize: 16, fontWeight: 500 }}>Image File</Text>
            <div
              style={{
                marginTop: 12,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'start',
              }}
            >
              <Upload
                listType='picture'
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept='image/*'
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </div>

            {fileList && fileList.length > 0 && (
              <>
                {/* <div style={{ marginBottom: '14px' }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    Image Label
                  </Text>
                  <Input
                    value={aboutUs?.imageLabel ?? ''}
                    onChange={(e) =>
                      handleAboutUsInputChange('imageLabel', e.target.value)
                    }
                    placeholder='Enter image label'
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  />
                </div> */}

                <div style={{ marginBottom: '14px' }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    Image Caption
                  </Text>
                  <Input
                    value={aboutUs?.imageCaption ?? ''}
                    onChange={(e) =>
                      handleAboutUsInputChange('imageCaption', e.target.value)
                    }
                    placeholder='Enter image caption'
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  />
                </div>
              </>
            )}

            {/* Editable Fields */}
            {[
              {
                title: {
                  label: 'Welcome Title',
                  key: 'welcomeTitle',
                  value: aboutUs?.welcomeTitle ?? '',
                },
                description: {
                  label: 'Welcome Description',
                  key: 'welcomeDescription',
                  value: aboutUs?.welcomeDescription ?? '',
                },
              },
              {
                title: {
                  label: 'Our Story Title',
                  key: 'ourStoryTitle',
                  value: aboutUs?.ourStoryTitle ?? '',
                },
                description: {
                  label: 'Our Story Description',
                  key: 'ourStoryDescription',
                  value: aboutUs?.ourStoryDescription ?? '',
                },
              },
              {
                title: {
                  label: 'Our Expertise Title',
                  key: 'ourExpertiseTitle',
                  value: aboutUs?.ourExpertiseTitle ?? '',
                },
                description: {
                  label: 'Our Expertise Description',
                  key: 'ourExpertiseDescription',
                  value: aboutUs?.ourExpertiseDescription ?? '',
                },
              },
            ].map(({ title, description }) => (
              <React.Fragment key={title.key}>
                <div style={{ marginBottom: '14px' }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    {title.label}
                  </Text>
                  <Input
                    value={title.value}
                    onChange={(e) =>
                      handleAboutUsInputChange(title.key, e.target.value)
                    }
                    placeholder={title.label}
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    {description.label}
                  </Text>
                  <TextArea
                    value={
                      description.value?.replace(/<br\s*\/?>/g, '\n') || ''
                    }
                    onChange={(e) =>
                      handleAboutUsInputChange(description.key, e.target.value)
                    }
                    placeholder={description.label}
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      minHeight: 200,
                    }}
                  />
                </div>
              </React.Fragment>
            ))}

            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                Our Core Values
              </Text>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  marginTop: '8px',
                }}
              >
                {(Array.isArray(coreValues) ? coreValues : []).map(
                  (value, index) => (
                    <div
                      key={index}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                        }}
                      >
                        Edit {value.title}
                      </Text> */}

                      {/* Title */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '80px',
                          }}
                        >
                          Title:
                        </Text>
                        <Input
                          type='text'
                          value={value.title}
                          onChange={(e) =>
                            handleCoreValuesChange(
                              index,
                              'title',
                              e.target.value
                            )
                          }
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d9d9d9',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                          placeholder='Title'
                        />
                      </div>

                      {/* Description */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '80px',
                          }}
                        >
                          Description:
                        </Text>
                        <Input
                          type='text'
                          value={value.description}
                          onChange={(e) =>
                            handleCoreValuesChange(
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d9d9d9',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                          placeholder='Description'
                        />
                      </div>

                      {/* Icon Color */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '80px',
                          }}
                        >
                          Icon Color:
                        </Text>
                        {/* Ant Design Color Picker */}
                        <ColorPicker
                          value={value.color || '#000000'}
                          defaultFormat='hex'
                          onChange={(color) =>
                            handleCoreValuesChange(
                              index,
                              'color',
                              color.toHexString()
                            )
                          }
                        />

                        {/* Color Preview Box */}
                        <div
                          style={{
                            marginLeft: '6px',
                            padding: '4px',
                            borderRadius: '6px',
                            border: '1px solid #d9d9d9',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                        >
                          <span>{value.color || '#000000'}</span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Tabs Background Color */}
            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                Tabs Background Color
              </Text>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                {/* Ant Design Color Picker */}
                <ColorPicker
                  value={aboutUs?.tabsBackgroundColor || '#23abff'}
                  defaultFormat='hex'
                  onChange={(color) =>
                    handleAboutUsInputChange(
                      'tabsBackgroundColor',
                      color.toHexString()
                    )
                  }
                />

                {/* Color Preview Box */}
                <div
                  style={{
                    marginLeft: '6px',
                    padding: '4px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span>{aboutUs?.tabsBackgroundColor || '#23abff'}</span>
                </div>
              </div>
            </div>

            <Button
              type='primary'
              style={{
                width: '100%',
                height: '40px',
                marginTop: 20,
                fontSize: '16px',
              }}
              onClick={handleSaveAboutUs}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
        {selectedSection === 'contact_us' && (
          <div style={{ marginBottom: 16, display: 'inline' }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              Contact Us
            </h3>

            {/* Image Upload */}
            <Text style={{ fontSize: 16, fontWeight: 500 }}>
              Background Image File
            </Text>
            <div
              style={{
                marginTop: 10,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'start',
              }}
            >
              <Upload
                listType='picture'
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept='image/*'
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </div>

            {/* Editable Fields */}
            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                Heading Text
              </Text>
              <Input
                value={contactUs?.headingText ?? ''}
                onChange={(e) =>
                  handleContactUsInputChange('headingText', e.target.value)
                }
                placeholder='Enter heading text'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                Heading Description
              </Text>
              <TextArea
                value={contactUs?.headingDescription}
                onChange={(e) =>
                  handleContactUsInputChange(
                    'headingDescription',
                    e.target.value
                  )
                }
                placeholder='Enter heading descriptiom'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  minHeight: 100,
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                Contact Number
              </Text>
              <Input
                value={contactUs?.contactNumber ?? ''}
                onChange={(e) =>
                  handleContactUsInputChange('contactNumber', e.target.value)
                }
                placeholder='Enter contact number'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Email</Text>
              <Input
                value={contactUs?.email ?? ''}
                onChange={(e) =>
                  handleContactUsInputChange('email', e.target.value)
                }
                placeholder='Enter email'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Address</Text>
              <Input
                value={contactUs?.address ?? ''}
                onChange={(e) =>
                  handleContactUsInputChange('address', e.target.value)
                }
                placeholder='Enter address'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            </div>

            <Button
              type='primary'
              style={{
                width: '100%',
                height: '40px',
                marginTop: 20,
                fontSize: '16px',
              }}
              onClick={handleSaveContactUs}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
        {selectedSection === 'header_section' && (
          <div style={{ marginBottom: 16, display: 'inline' }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              Header Section
            </h3>

            {/* Editable Fields */}
            <div style={{ marginTop: 20 }}>
              {/* Boolean Toggles */}
              {[
                { label: 'Promos', key: 'showPromos' },
                { label: 'Routes', key: 'showRoutes' },
                { label: 'Resources', key: 'showResources' },
                { label: 'About Us', key: 'showAboutUs' },
              ].map(({ label, key }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{label}</Text>
                  <Switch
                    checked={headerSection?.[key] || false}
                    onChange={handleHeaderSectionToggleChange(key)}
                  />
                </div>
              ))}
            </div>

            <Button
              type='primary'
              style={{
                width: '100%',
                height: '40px',
                marginTop: 20,
                fontSize: '16px',
              }}
              onClick={handleSaveHeaderSection}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
        {selectedSection === 'hero_section' && (
          <div style={{ marginBottom: 16, display: 'inline' }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              Hero Section
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 500 }}>
                Background Type
              </Text>
              <Radio.Group
                value={backgroundType}
                onChange={(e) => {
                  setBackgroundType(e.target.value);
                  setFileList([]);
                }}
                style={{ marginTop: 12 }}
              >
                <Radio value='image'>Image</Radio>
                <Radio value='video'>Video</Radio>
                <Radio value='youtube'>Youtube</Radio>
              </Radio.Group>
            </div>

            {(backgroundType === 'image' || backgroundType === 'video') && (
              <>
                {/* Image Upload */}
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Image File
                </Text>
                <div
                  style={{
                    marginTop: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'start',
                  }}
                >
                  <Upload
                    listType='picture'
                    fileList={fileList}
                    onChange={handleUpload}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    accept={getAcceptType()}
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </div>

                {/* Show Image Label Only If File Exists */}
                {/* {fileList && fileList.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <Text style={{ fontSize: 16, fontWeight: 500 }}>
                      Image Label
                    </Text>
                    <Input
                      value={heroSection?.label ?? ''}
                      onChange={(e) =>
                        handleHeroSectionInputChange('label', e.target.value)
                      }
                      placeholder='Enter image label'
                      style={{
                        marginTop: '8px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    />
                  </div>
                )} */}
              </>
            )}

            {backgroundType === 'youtube' && (
              <div style={{ marginBottom: '14px' }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  YouTube URL
                </Text>
                <Input
                  value={heroSection?.youtubeUrl ?? ''}
                  onChange={(e) =>
                    handleHeroSectionInputChange('youtubeUrl', e.target.value)
                  }
                  placeholder='Enter YouTube URL'
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                />
              </div>
            )}

            {/* Editable Fields */}
            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Caption 1</Text>
              <TextArea
                value={heroSection?.caption1}
                onChange={(e) =>
                  handleHeroSectionInputChange('caption1', e.target.value)
                }
                placeholder='Enter heading descriptiom'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  minHeight: 100,
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Caption 2</Text>
              <TextArea
                value={heroSection?.caption2}
                onChange={(e) =>
                  handleHeroSectionInputChange('caption2', e.target.value)
                }
                placeholder='Enter heading descriptiom'
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  minHeight: 100,
                }}
              />
            </div>

            <Button
              type='primary'
              style={{
                width: '100%',
                height: '40px',
                marginTop: 20,
                fontSize: '16px',
              }}
              onClick={handleSaveHeroSection}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
        {selectedSection === 'footer_section' && (
          <div style={{ marginBottom: 16, display: 'inline' }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 14,
              }}
            >
              Footer Section
            </h3>

            {/* Editable Fields */}
            <div style={{ marginTop: 20 }}>
              {/* Boolean Toggles */}
              {[
                { label: 'About Us', key: 'hasAboutUs' },
                { label: 'Press', key: 'hasPress' },
                { label: 'FAQ', key: 'hasFaq' },
                { label: 'Privacy Policy', key: 'hasPrivacyPolicy' },
                { label: 'Terms & Conditions', key: 'hasTermsAndConditions' },
              ].map(({ label, key }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{label}</Text>
                  <Switch
                    checked={footerSection?.[key] || false}
                    onChange={handleFooterSectionToggleChange(key)}
                  />
                </div>
              ))}

              {/* Contact Information */}
              <div style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Primary Contact
                </Text>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 6,
                  }}
                >
                  <Input
                    value={footerSection?.primaryContactNumberNetwork}
                    pplaceholder='e.g. Globe/TM, Smart/Sun, Telephone'
                    style={{ width: '100%' }}
                    onChange={(e) =>
                      handleFooterSectionInputChange(
                        'primaryContactNumberNetwork',
                        e.target.value
                      )
                    }
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      width: '5%',
                    }}
                  >
                    :
                  </Text>
                  <Input
                    value={footerSection?.primaryContactNumber}
                    placeholder='e.g. 09123456789, (032)-123-4567'
                    style={{ width: '100%' }}
                    onChange={(e) =>
                      handleFooterSectionInputChange(
                        'primaryContactNumber',
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Secondary Contact
                </Text>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 6,
                  }}
                >
                  <Input
                    value={footerSection?.secondaryContactNumberNetwork}
                    placeholder='e.g. Globe/TM, Smart/Sun, Telephone'
                    style={{ width: '100%' }}
                    onChange={(e) =>
                      handleFooterSectionInputChange(
                        'secondaryContactNumberNetwork',
                        e.target.value
                      )
                    }
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      width: '5%',
                    }}
                  >
                    :
                  </Text>
                  <Input
                    value={footerSection?.secondaryContactNumber}
                    placeholder='Enter secondary contact'
                    style={{ width: '100%' }}
                    onChange={(e) =>
                      handleFooterSectionInputChange(
                        'secondaryContactNumber',
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>Email</Text>
                <Input
                  value={footerSection?.email}
                  placeholder='Email'
                  style={{ marginTop: 6 }}
                  onChange={(e) =>
                    handleFooterSectionInputChange('email', e.target.value)
                  }
                />
              </div>

              {/* Social Media Links */}
              <div style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Social Media Links
                </Text>
                <Input
                  value={footerSection?.twitterUrl}
                  placeholder='Twitter URL'
                  style={{ marginTop: 6 }}
                  onChange={(e) =>
                    handleFooterSectionInputChange('twitterUrl', e.target.value)
                  }
                />
                <Input
                  value={footerSection?.facebookUrl}
                  placeholder='Facebook URL'
                  style={{ marginTop: 12 }}
                  onChange={(e) =>
                    handleFooterSectionInputChange(
                      'facebookUrl',
                      e.target.value
                    )
                  }
                />
                <Input
                  value={footerSection?.linkedInUrl}
                  placeholder='LinkedIn URL'
                  style={{ marginTop: 12 }}
                  onChange={(e) =>
                    handleFooterSectionInputChange(
                      'linkedInUrl',
                      e.target.value
                    )
                  }
                />
                <Input
                  value={footerSection?.instagramUrl}
                  placeholder='Instagram URL'
                  style={{ marginTop: 12 }}
                  onChange={(e) =>
                    handleFooterSectionInputChange(
                      'instagramUrl',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <Button
              type='primary'
              style={{
                width: '100%',
                height: '40px',
                marginTop: 20,
                fontSize: '16px',
              }}
              onClick={handleSaveFooterSection}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
        {selectedSection === 'theme_settings' && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 14 }}>
              Theme Settings
            </h3>

            {/* Editable Fields */}
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Font Style</Text>
              <Select
                value={themeSettings?.fontStyle || ''}
                onChange={handleThemeSettingsFontChange}
                options={fontOptions}
                style={{ width: '100%', marginTop: 6 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Color Theme</Text>
              <Select
                value={colorTheme}
                onChange={(value) =>
                  setColorTheme(value as keyof IThemeSettings)
                }
                options={colorOptions}
                style={{ width: '100%', marginTop: 6 }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                width: '100%',
              }}
            >
              {Object.entries(themeSettings || [])
                .filter(([key]) =>
                  colorTheme === 'background'
                    ? key === 'backgroundColor'
                    : colorTheme === 'border'
                    ? key === 'borderColor'
                    : colorTheme === 'button'
                    ? [
                        'buttonDefaultColor',
                        'buttonDestructiveColor',
                        'buttonOutlineColor',
                        'buttonSecondaryColor',
                        'buttonGhostColor',
                        'buttonLinkColor',
                      ].includes(key)
                    : colorTheme === 'icon'
                    ? key === 'iconColor'
                    : false
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <Text strong>
                        {toTitleCase(
                          key
                            .replace('button', '')
                            .replace(/([A-Z])/g, ' $1')
                            .trim()
                        )}
                      </Text>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '6px',
                        }}
                      >
                        <ColorPicker
                          value={themeSettings?.[key] || '#000000'}
                          defaultFormat='hex'
                          onChange={(color) =>
                            handleThemeSettingsColorChange(
                              key as keyof IThemeSettings,
                              color.toHexString()
                            )
                          }
                        />
                        <div
                          style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            border: '1px solid #ccc',
                            background: '#f8f8f8',
                          }}
                        >
                          <Text>{themeSettings?.[key] || '#000000'}</Text>
                        </div>
                      </div>
                    </div>
                    <div style={{ alignSelf: 'end' }}>
                      {colorTheme === 'background' && (
                        <div
                          style={{
                            width: '100%',
                            height: '60px',
                            backgroundColor: themeSettings?.[key] || '#000000',
                            borderRadius: '8px',
                          }}
                        ></div>
                      )}
                      {colorTheme === 'border' && (
                        <div
                          style={{
                            width: '100%',
                            height: '60px',
                            borderColor: themeSettings?.[key] || '#000000',
                            border: `2px solid ${
                              themeSettings?.[key] || '#cccccc'
                            }`,
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                          }}
                        ></div>
                      )}
                      {colorTheme === 'icon' && (
                        <div
                          style={{
                            fontSize: '22px',
                            color: themeSettings?.[key] || '#000000',
                          }}
                        >
                          <BiSolidShip />
                          <HiUsers />
                          <IoMdPin />
                          <GrCar />
                          <FaShip />
                          <FaPhoneAlt />
                          <IoArrowBack />
                          <PiInfo />
                          <FiLoader />
                          <LuArrowRightLeft />
                        </div>
                      )}
                      {colorTheme === 'button' &&
                        (key === 'buttonDefaultColor' ? (
                          <Button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'background-color 0.2s ease-in-out',
                              outline: 'none',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: 'none',
                              opacity: loading ? 0.5 : 1,
                              pointerEvents: loading ? 'none' : 'auto',
                              backgroundColor:
                                themeSettings?.[key] || '#000000',
                              color: '#ffffff',
                            }}
                          >
                            Default Button
                          </Button>
                        ) : key === 'buttonDestructiveColor' ? (
                          <Button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'background-color 0.2s ease-in-out',
                              outline: 'none',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: 'none',
                              opacity: loading ? 0.5 : 1,
                              pointerEvents: loading ? 'none' : 'auto',
                              backgroundColor:
                                themeSettings?.[key] || '#ff0000',
                              color: '#ffffff',
                            }}
                          >
                            Destructive Button
                          </Button>
                        ) : key === 'buttonOutlineColor' ? (
                          <Button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'background-color 0.2s ease-in-out',
                              outline: 'none',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              opacity: loading ? 0.5 : 1,
                              pointerEvents: loading ? 'none' : 'auto',
                              backgroundColor: 'transparent',
                              border: `2px solid ${
                                themeSettings?.[key] || '#cccccc'
                              }`,
                              color: themeSettings?.[key] || '#cccccc',
                            }}
                          >
                            Outline Button
                          </Button>
                        ) : key === 'buttonSecondaryColor' ? (
                          <Button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'background-color 0.2s ease-in-out',
                              outline: 'none',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: 'none',
                              opacity: loading ? 0.5 : 1,
                              pointerEvents: loading ? 'none' : 'auto',
                              backgroundColor:
                                themeSettings?.[key] || '#888888',
                              color: '#ffffff',
                            }}
                          >
                            Secondary Button
                          </Button>
                        ) : key === 'buttonGhostColor' ? (
                          <Button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'background-color 0.2s ease-in-out',
                              outline: 'none',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: 'none',
                              opacity: loading ? 0.5 : 1,
                              pointerEvents: loading ? 'none' : 'auto',
                              backgroundColor: 'transparent',
                              color: themeSettings?.[key] || '#dddddd',
                            }}
                          >
                            Ghost Button
                          </Button>
                        ) : key === 'buttonLinkColor' ? (
                          <Button
                            type='link'
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'background-color 0.2s ease-in-out',
                              outline: 'none',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              border: 'none',
                              opacity: loading ? 0.5 : 1,
                              pointerEvents: loading ? 'none' : 'auto',
                              color: themeSettings?.[key] || '#0000ff',
                              textUnderlineOffset: '4px',
                              transition: 'color 0.3s ease-in-out',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textDecoration =
                                'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            Link Button
                          </Button>
                        ) : null)}
                    </div>
                  </div>
                ))}
            </div>

            <Button
              type='primary'
              style={{
                width: '100%',
                height: '40px',
                marginTop: 20,
                fontSize: '16px',
              }}
              onClick={handleSaveThemeSettings}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
        {selectedSection === 'faq' && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 14 }}>
              FAQ
            </h3>

            <div style={{ marginBottom: 35 }}>
              <Text style={{ fontSize: 16, fontWeight: 500 }}>Category</Text>
              <Select
                value={faqCategory}
                onChange={handleFaqCategoryChange}
                options={faqCategoryOptions}
                style={{ width: '100%', marginTop: 6 }}
              />
            </div>

            {/* Editable Fields */}
            <Card
              title={`Add FAQ for ${faqCategory}`}
              style={{ marginBottom: 16 }}
            >
              <Form form={faqForm} layout='vertical'>
                <Form.Item
                  name='question'
                  label='Question'
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name='answer'
                  label='Answer'
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={4} style={{ height: '200px' }} />
                </Form.Item>
                <Form.Item>
                  <Space size={16}>
                    <Button type='primary' onClick={handleAddFAQ}>
                      Add FAQ
                    </Button>
                    <Button onClick={() => faqForm.resetFields()}>Clear</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
        {selectedSection === 'press' && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 14 }}>
              Press
            </h3>

            <Card title='Add Press' style={{ marginBottom: 16 }}>
              <Form
                form={pressForm}
                layout='vertical'
                initialValues={{
                  category: 'Research',
                  type: 'Article',
                }}
              >
                {/* Category dropdown */}
                <Form.Item
                  name='category'
                  label='Category'
                  rules={[{ required: true, message: 'Category is required' }]}
                >
                  <Select
                    placeholder='Select category'
                    options={categoryPressOptions.map((cat) => ({
                      label: cat,
                      value: cat,
                    }))}
                  />
                </Form.Item>

                {/* Type dropdown */}
                <Form.Item
                  name='type'
                  label='Type'
                  rules={[{ required: true, message: 'Type is required' }]}
                >
                  <Select
                    placeholder='Select type'
                    options={typePressOptions.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                  />
                </Form.Item>

                {/* Conditional fields based on type */}
                {selectedPressType === 'Video' && (
                  <Form.Item name='videoUrl' label='Video URL'>
                    <Input />
                  </Form.Item>
                )}

                {selectedPressType === 'Article' && (
                  <Form.Item name='articleUrl' label='Article URL'>
                    <Input />
                  </Form.Item>
                )}

                <Form.Item
                  name='title'
                  label='Title'
                  rules={[{ required: true, message: 'Title is required' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name='content'
                  label='Content'
                  rules={[{ required: true, message: 'Content is required' }]}
                >
                  <Input.TextArea rows={4} style={{ height: '200px' }} />
                </Form.Item>

                <Form.Item name='publishedDate' label='Published Date'>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name='isPublish'
                  label='Is Published?'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Space size={16}>
                    <Button type='primary' onClick={handleAddPress}>
                      Add Press
                    </Button>
                    <Button onClick={() => pressForm.resetFields()}>
                      Clear
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
        {selectedSection === 'privacy_policy' && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 14 }}>
              Privacy Policy
            </h3>

            <Card title='Add Privacy Policy' style={{ marginBottom: 16 }}>
              <Form form={privacyPolicyForm} layout='vertical'>
                <Form.Item
                  name='title'
                  label='Title'
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder='Select title'
                    options={privacyPolicyTitleOptions.map((opt) => ({
                      label: opt.label,
                      value: opt.label,
                      disabled: usedPrivacyPolicyTitleIds.includes(opt.value),
                    }))}
                    onChange={(val) =>
                      privacyPolicyForm.setFieldValue('title', val)
                    }
                  />
                </Form.Item>

                {selectedPrivacyPolicyTitle && (
                  <>
                    {selectedPrivacyPolicyTitle === 'Privacy Policy' ? (
                      <>
                        <Form.Item
                          name='content1'
                          label='Paragraph 1'
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>

                        <Form.Item
                          name='content2'
                          label='Paragraph 2'
                          rules={[{ required: true }]}
                        >
                          <Input.TextArea rows={4} />
                        </Form.Item>
                      </>
                    ) : (
                      <Form.Item
                        name='content'
                        label='Content (One paragraph per line)'
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea rows={6} />
                      </Form.Item>
                    )}

                    <Form.Item>
                      <Space size={16}>
                        <Button
                          type='primary'
                          onClick={handleAddPrivacyPolicy}
                          loading={loading}
                        >
                          Add Privacy Policy
                        </Button>
                        <Button
                          htmlType='button'
                          onClick={() => privacyPolicyForm.resetFields()}
                        >
                          Clear
                        </Button>
                      </Space>
                    </Form.Item>
                  </>
                )}
              </Form>
            </Card>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div
        style={{
          width: '50%',
          minHeight: '80vh',
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 30,
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {selectedSection !== 'faq' &&
          selectedSection !== 'press' &&
          selectedSection !== 'privacy_policy' && (
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                width: '100%',
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              <EyeOutlined /> Preview Area
            </h2>
          )}

        {loading ? (
          <p>Loading thumbnails...</p>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {selectedSection === 'thumbnails' && thumbnails.length > 0 ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleThumbnailDragEnd}
              >
                <SortableContext
                  items={thumbnails.map((thumbnail) => thumbnail.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      justifyContent: 'center',
                    }}
                  >
                    {thumbnails
                      .slice()
                      .sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
                      .map((thumbnail) => (
                        <div
                          key={thumbnail.id}
                          style={{
                            display: 'inline-block',
                            textAlign: 'center',
                            margin: 5,
                            marginBottom: 30,
                            position: 'relative', // Ensure positioning for the close button
                          }}
                        >
                          <SortableItem key={thumbnail.id} id={thumbnail.id}>
                            {/* Image */}
                            <img
                              src={`${S3_URL}/${thumbnail?.location?.toLowerCase()}/${
                                userData?.shippingLineId
                              }/${thumbnail.filename}?cache_buster=${uuidv4()}`}
                              style={{
                                width: 150,
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginBottom: 5,
                              }}
                            />
                          </SortableItem>

                          {/* Close Icon */}
                          <div
                            onClick={() =>
                              handleThumbnailRemoveImage(
                                thumbnail?.id ?? 0,
                                thumbnail?.filename ?? ''
                              )
                            }
                            style={{
                              position: 'absolute',
                              top: 22, // Position in the center vertically
                              right: 6,
                              transform: 'translateY(-50%)', // Adjust for perfect centering
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              borderRadius: '50%',
                              width: 30, // Make the circle a bit bigger for better visibility
                              height: 30, // Same as width for perfect circle
                              display: 'flex', // Use flex to center the icon
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <CloseOutlined style={{ fontSize: 14 }} />
                          </div>

                          {/* Editable Label */}
                          <EditableThumbnailLabel
                            label={thumbnail.label}
                            onSave={(newLabel: any) =>
                              handleThumbnailSaveLabel(
                                thumbnail?.id ?? 0,
                                newLabel
                              )
                            }
                          />

                          {/* Image Change Button */}
                          <Button
                            icon={<UploadOutlined />}
                            onClick={() =>
                              handleThumbnailEditClick(thumbnail?.id ?? 0)
                            }
                            style={{ marginTop: 6, width: '100%' }}
                          >
                            Image Change
                          </Button>

                          {/* File Input */}
                          <input
                            type='file'
                            accept='image/*'
                            style={{ display: 'none' }}
                            ref={(el) =>
                              (fileInputs.current[thumbnail?.id ?? 0] = el)
                            }
                            onChange={(e) =>
                              handleThumbnailUpdateFileUpload(e, thumbnail)
                            }
                          />
                        </div>
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : selectedSection === 'about_us' ? (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                {aboutUs?.imageFilename && (
                  <img
                    src={`${S3_URL}/${selectedSection.toLowerCase()}/${
                      userData?.shippingLineId
                    }/${aboutUs?.imageFilename}?cache_buster=${uuidv4()}`}
                    alt=''
                    style={{
                      width: '100%',
                      height: 'auto',
                      marginTop: '16px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                )}
              </div>
            ) : selectedSection === 'contact_us' ? (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                {contactUs?.backgroundImageFilename && (
                  <img
                    src={`${S3_URL}/${selectedSection.toLowerCase()}/${
                      userData?.shippingLineId
                    }/${
                      contactUs?.backgroundImageFilename
                    }?cache_buster=${uuidv4()}`}
                    alt=''
                    style={{
                      width: '100%',
                      height: 'auto',
                      marginTop: '16px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                )}
              </div>
            ) : selectedSection === 'hero_section' ? (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                {heroSection?.filename &&
                  heroSection?.fileType.toLowerCase() == 'image' && (
                    <img
                      src={`${S3_URL}/${selectedSection.toLowerCase()}/${
                        userData?.shippingLineId
                      }/${heroSection?.filename}?cache_buster=${uuidv4()}`}
                      alt=''
                      style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '16px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                  )}
                {heroSection?.filename &&
                  heroSection?.fileType.toLowerCase() === 'video' && (
                    <video
                      autoPlay
                      muted
                      loop // Optional: Loops video continuously
                      playsInline // Ensures proper autoplay behavior on mobile devices
                      style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '16px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    >
                      <source
                        src={`${S3_URL}/${selectedSection.toLowerCase()}/${
                          userData?.shippingLineId
                        }/${heroSection?.filename}?cache_buster=${uuidv4()}`}
                        type='video/mp4'
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                {heroSection?.youtubeUrl &&
                  heroSection?.fileType.toLowerCase() === 'youtube' && (
                    <iframe
                      width='550'
                      height='500'
                      src={`https://www.youtube.com/embed/${extractYouTubeID(
                        heroSection?.youtubeUrl
                      )}?autoplay=1&mute=1&loop=1&playlist=${extractYouTubeID(
                        heroSection?.youtubeUrl
                      )}`}
                      title='YouTube Video'
                      frameBorder='0'
                      allow='autoplay; encrypted-media'
                      allowFullScreen
                      style={{
                        marginTop: '16px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                  )}
              </div>
            ) : selectedSection === 'faq' ? (
              <div style={{ width: '100%' }}>
                <h2 style={{ paddingBottom: 10 }}>FAQs for {faqCategory}</h2>
                <FaqTable
                  ref={tableFaqRef}
                  category={faqCategory}
                  shippingLineId={userData?.shippingLineId}
                />
              </div>
            ) : selectedSection === 'press' ? (
              <div style={{ padding: 16, width: '100%' }}>
                <h2 style={{ paddingBottom: 10 }}>Press</h2>
                <PressTable
                  ref={tablePressRef}
                  shippingLineId={userData?.shippingLineId}
                />
              </div>
            ) : selectedSection === 'privacy_policy' ? (
              <div style={{ padding: 16, width: '100%' }}>
                <h2 style={{ paddingBottom: 10 }}>Privacy Policy</h2>
                <PrivacyPolicyTable
                  ref={tablePressRef}
                  shippingLineId={userData?.shippingLineId}
                  onDeleted={() =>
                    fetchUsedPrivacyPolicyTitles(userData?.shippingLineId)
                  }
                />
              </div>
            ) : (
              <p>No thumbnails available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
