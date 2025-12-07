import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { kycAPI } from '../../services/api';

const KYCScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState({
    license: false,
    registration: false,
    insurance: false,
    photo: false,
  });
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { key: 'license', label: 'Driving License', icon: '🪪', desc: 'Upload front & back' },
    { key: 'registration', label: 'Vehicle Registration', icon: '🚗', desc: 'RC book copy' },
    { key: 'insurance', label: 'Vehicle Insurance', icon: '🛡️', desc: 'Valid insurance copy' },
    { key: 'photo', label: 'Profile Photo', icon: '📷', desc: 'Clear face photo' },
  ];

  const handleUploadDocument = async (docType) => {
    // In production, use react-native-image-picker to select file
    // For now, mark as uploaded
    setDocuments(prev => ({ ...prev, [docType]: true }));
    Toast.show({
      type: 'success',
      text1: 'Document Uploaded',
      text2: 'Your document has been uploaded',
    });
  };

  const allDocumentsUploaded = Object.values(documents).every(Boolean);

  const handleSubmit = async () => {
    if (!allDocumentsUploaded) {
      Alert.alert('Incomplete', 'Please upload all documents to proceed');
      return;
    }

    setUploading(true);
    try {
      // In production, upload actual files
      Toast.show({
        type: 'success',
        text1: 'Documents Submitted',
        text2: 'Your KYC will be verified within 24-48 hours',
      });
      // Navigate to waiting screen or back to login
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit documents',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Upload</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Complete Your KYC</Text>
            <Text style={styles.infoText}>
              Upload all required documents to start earning with HimGo
            </Text>
          </View>
        </View>

        <View style={styles.documentsList}>
          {documentTypes.map((doc) => (
            <TouchableOpacity
              key={doc.key}
              style={[
                styles.documentItem,
                documents[doc.key] && styles.documentItemCompleted
              ]}
              onPress={() => handleUploadDocument(doc.key)}
            >
              <View style={[
                styles.iconBox,
                documents[doc.key] && styles.iconBoxCompleted
              ]}>
                <Text style={styles.iconText}>
                  {documents[doc.key] ? '✓' : doc.icon}
                </Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                <Text style={styles.docDesc}>{doc.desc}</Text>
              </View>
              <Text style={styles.uploadIcon}>📤</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !allDocumentsUploaded && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!allDocumentsUploaded || uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? 'Submitting...' : 'Submit Documents'}
          </Text>
          <Text style={styles.submitButtonIcon}>✈️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    fontSize: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#e6f7f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  documentsList: {
    gap: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    backgroundColor: 'white',
  },
  documentItemCompleted: {
    borderColor: '#00914e',
    backgroundColor: '#e6f7f0',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxCompleted: {
    backgroundColor: '#b3e5db',
  },
  iconText: {
    fontSize: 24,
  },
  docInfo: {
    flex: 1,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  docDesc: {
    fontSize: 12,
    color: '#999',
  },
  uploadIcon: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#00914e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonIcon: {
    fontSize: 16,
  },
});

export default KYCScreen;
