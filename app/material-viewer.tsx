import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { MaterialIcons } from '@expo/vector-icons';

export default function MaterialViewer() {
  const { fileUri, title } = useLocalSearchParams(); // Get params using useLocalSearchParams
  const [dataUrl, setDataUrl] = useState(null);
  const [viewerType, setViewerType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const loadFile = async () => {
      try {
        if (!fileUri) {
          throw new Error("File URI not provided");
        }
        console.log("MaterialViewer: Received file URI:", fileUri);
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log("MaterialViewer: File info:", fileInfo);
        if (!fileInfo.exists) {
          throw new Error("File not found at stored location. Please re-import the book.");
        }
        // Determine file type based on extension
        const lowerUri = (fileUri as string).toLowerCase();  // Assert type as string
        let type;
        if (lowerUri.endsWith('.pdf')) {
          type = 'pdf';
        } else if (lowerUri.endsWith('.epub')) {
          type = 'epub';
        } else {
          throw new Error("Unsupported file type");
        }
        setViewerType(type);
        // Read the file as a base64 string
        const base64 = await FileSystem.readAsStringAsync(fileUri as string, { encoding: FileSystem.EncodingType.Base64 }); // Assert type as string
        const prefix = type === 'pdf'
          ? "data:application/pdf;base64,"
          : "data:application/epub+zip;base64,";
        const fullDataUrl = prefix + base64;
        console.log("MaterialViewer: Data URL created.");
        setDataUrl(fullDataUrl);
      } catch (error) {
        Alert.alert('Error', 'Failed to load file: ' + error.message);
        console.error("MaterialViewer Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [fileUri]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  if (!dataUrl) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Remove the MIME prefix to get the pure base64 string.
  let pureBase64;
  if (viewerType === 'pdf') {
    pureBase64 = dataUrl.replace("data:application/pdf;base64,", "");
  } else if (viewerType === 'epub') {
    pureBase64 = dataUrl.replace("data:application/epub+zip;base64,", "");
  }

  let html = "";
  if (viewerType === 'pdf') {
    html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>PDF Viewer</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
          <style>
            body { margin: 0; padding: 0; background-color: ${isDarkMode ? '#121212' : '#FFFFFF'}; }
            canvas { display: block; margin: 0 auto 10px auto; }
          </style>
        </head>
        <body>
          <div id="container"></div>
          <script>
            (function() {
              const base64String = ${JSON.stringify(pureBase64)};
              function base64ToUint8Array(base64) {
                const raw = atob(base64);
                const uint8Array = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) {
                  uint8Array[i] = raw.charCodeAt(i);
                }
                return uint8Array;
              }
              const pdfDataArray = base64ToUint8Array(base64String);
              const loadingTask = pdfjsLib.getDocument({ data: pdfDataArray });
              loadingTask.promise.then(pdf => {
                const container = document.getElementById('container');
                function renderPage(pageNum) {
                  pdf.getPage(pageNum).then(page => {
                    const scale = 2.0;
                    const viewport = page.getViewport({ scale: scale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    container.appendChild(canvas);
                    const renderContext = {
                      canvasContext: context,
                      viewport: viewport
                    };
                    page.render(renderContext).promise.then(() => {
                      if (pageNum < pdf.numPages) {
                        renderPage(pageNum + 1);
                      }
                    });
                  });
                }
                renderPage(1);
              }).catch(err => {
                document.body.innerHTML = '<p style="color: ${isDarkMode ? '#FFFFFF' : '#000000'};">Error loading PDF: ' + err + '</p>';
              });
            })();
          </script>
        </body>
      </html>
    `;
  } else if (viewerType === 'epub') {
    // For EPUB, pass the pure base64 data directly to epub.js
    html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>EPUB Viewer</title>
          <script src="https://unpkg.com/epubjs/dist/epub.min.js" defer></script>
          <style>
            html, body { margin: 0; padding: 0; height: 100%; background-color: ${isDarkMode ? '#121212' : '#FFFFFF'}; color: ${isDarkMode ? '#FFFFFF' : '#000000'}; }
            #viewer { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="viewer"></div>
          <script>
            window.onload = function() {
              try {
                const base64String = ${JSON.stringify(pureBase64)};
                const book = ePub({ encoding: 'base64', data: base64String });
                book.ready.then(() => {
                  console.log("Book is ready. Spine length:", book.spine && book.spine.length ? book.spine.length : "unknown");
                  const rendition = book.renderTo("viewer", {
                    width: "100%",
                    height: "100%"
                  });
                  rendition.on("rendered", (section) => {
                    console.log("Section rendered:", section.href);
                  });
                  rendition.display().catch(err => {
                    console.log("Rendition display error:", err);
                  });
                }).catch(err => {
                  console.log("Book ready error:", err);
                });
              } catch(e) {
                document.body.innerHTML = '<p>Error: ' + e + '</p>';
                console.log("Error in injected script:", e);
              }
            }
          </script>
        </body>
      </html>
    `;
  } else {
    html = "<p>Unsupported file type.</p>";
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.darkModeButton}
        onPress={toggleDarkMode}
      >
        <Text style={[styles.darkModeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
      </TouchableOpacity>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 10,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  darkModeButton: {
    backgroundColor: 'transparent',
    padding: 10,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  darkModeButtonText: {
    fontSize: 16,
  },
});
