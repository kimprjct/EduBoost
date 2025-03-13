import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ExpoFileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, borderRadius, layout } from './theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface StudyFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'docx' | 'note';
  dateAdded: string;
  uri: string;
}

export default function MaterialsScreen() {
  const [isGridView, setIsGridView] = useState(false);
  const [files, setFiles] = useState<StudyFile[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const storedFiles = await AsyncStorage.getItem('studyMaterials');
      setFiles(storedFiles ? JSON.parse(storedFiles) : []);
    } catch (error) {
      console.error('Error loading study materials:', error);
    }
  };

  const handleAddMaterial = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const fileName = file.name;
      let fileType: StudyFile['type'] = 'note'; // Default type
      if (file.mimeType?.includes('pdf')) {
        fileType = 'pdf';
      } else if (file.mimeType?.includes('image')) {
        fileType = 'image';
      } else if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileType = 'docx';
      }

      const newPath = `${ExpoFileSystem.documentDirectory}materials/${fileName}`;

      // Ensure directory exists
      await ExpoFileSystem.makeDirectoryAsync(
        `${ExpoFileSystem.documentDirectory}materials`,
        { intermediates: true }
      );

      // Copy file to local storage
      await ExpoFileSystem.copyAsync({ from: file.uri, to: newPath });

      const newFile: StudyFile = {
        id: Date.now().toString(),
        name: fileName,
        type: fileType,
        dateAdded: new Date().toISOString().split('T')[0],
        uri: newPath,
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      await AsyncStorage.setItem('studyMaterials', JSON.stringify(updatedFiles));

      console.log('File saved:', newPath);
    } catch (error) {
      console.error('Error adding material:', error);
      Alert.alert('Error', 'Failed to add study material');
    }
  };

  const handleDeleteMaterial = async (id: string, uri: string) => {
    try {
      await ExpoFileSystem.deleteAsync(uri, { idempotent: true });

      const updatedFiles = files.filter((file) => file.id !== id);
      setFiles(updatedFiles);
      await AsyncStorage.setItem('studyMaterials', JSON.stringify(updatedFiles));

      console.log('File deleted:', uri);
    } catch (error) {
      console.error('Error deleting file:', error);
      Alert.alert('Error', 'Failed to delete file');
    }
  };

  const renderFileCard = ({ item }: { item: StudyFile }) => (
    <TouchableOpacity
      style={[styles.fileCard, isGridView ? styles.gridCard : styles.listCard]}
      onPress={() => router.push({ pathname: '/material-viewer', params: { fileUri: item.uri, title: item.name } })}
    >
      <LinearGradient colors={[colors.background.card, colors.background.secondary]} style={StyleSheet.absoluteFill} />
      <View style={styles.fileIconContainer}>
        <MaterialIcons name={item.type === 'pdf' ? 'picture-as-pdf' : item.type === 'image' ? 'image' : item.type === 'docx' ? 'description' : 'description'} size={24} color={colors.primary} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.fileDate}>{item.dateAdded}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => handleDeleteMaterial(item.id, item.uri)} style={styles.optionsButton}>
          <MaterialIcons name="delete" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.background.gradient} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Study Materials</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsGridView(!isGridView)}>
          <MaterialIcons name={isGridView ? 'view-list' : 'grid-view'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        renderItem={renderFileCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.fileList}
        key={isGridView ? 'grid' : 'list'}
        numColumns={isGridView ? 2 : 1}
      />

      <TouchableOpacity style={[styles.fab, layout.glowEffect]} onPress={handleAddMaterial}>
        <MaterialIcons name="add" size={24} color={colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    height: 50,
   
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  toggleButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.secondary,
  },
  fileList: {
    padding: spacing.sm,
  },
  fileCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  gridCard: {
    flex: 1,
    margin: spacing.xs,
    aspectRatio: 1,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  fileDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  optionsButton: {
    padding: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
