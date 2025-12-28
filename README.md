# MAS Holdings 3D Fashion Library - Feature Guide

## Overview
The Fashion Library is now a complete digital asset management system with upload, categorization, search, and 3D viewing capabilities using hand gesture controls.

## Key Features

### 📤 Upload System
- **Upload Modal**: Click "Upload New" in the header
- **Required Fields**:
  - 3D Model file (.glb format)
  - Asset name
  - Category selection
- **Optional Fields**:
  - Tags (comma-separated for better searchability)
  - Description notes
- **Auto-generated**:
  - Unique ID
  - Upload timestamp
  - File size calculation

### 🗂️ Categorization
Pre-defined categories for fashion items:
- Tops
- Bottoms
- Dresses
- Outerwear
- Accessories
- Footwear
- Other

### 🔍 Search & Filter
- **Search Bar**: Search by asset name or tags in real-time
- **Category Filter**: Quick filter buttons to view specific categories
- **View All**: "All" category shows entire library

### 📚 Library Sidebar
- **Asset Cards**: Display with:
  - Asset name
  - Category badge
  - File size
  - Tags (up to 3 visible)
  - Upload date
  - Delete button (on hover)
- **Active Indicator**: Currently viewed asset highlighted in dark theme
- **Empty State**: Helpful message when no assets exist

### 👁️ 3D Viewer
- **Hand Gesture Controls**:
  - **One Hand**: Rotate model 360° in any direction
  - **Two Hands**: Pinch to zoom in/out
- **Reset Button**: Return camera to default position
- **Professional Lighting**: Studio environment with realistic shadows

### 💾 Persistent Storage
- All assets saved to browser storage
- Survives page refreshes
- Base64 encoding for 3D models
- Organized with `asset:` prefix for easy management

### 🗑️ Asset Management
- **Delete Assets**: Click trash icon on any asset card
- **Confirmation Dialog**: Prevents accidental deletion
- **Automatic Cleanup**: Storage updated immediately

## File Structure

```
components/
├── Header.tsx           - Top navigation with upload button
├── LibrarySidebar.tsx   - Search, filter, and asset list
├── UploadModal.tsx      - Asset upload form
├── Viewer3D.tsx         - 3D rendering engine
├── HandController.tsx   - MediaPipe gesture detection
└── Sidebar.tsx          - (Legacy, can be removed)

types.ts                 - TypeScript interfaces
storage.d.ts            - Storage API type declarations
App.tsx                 - Main application logic
```

## Usage Flow

1. **First Time**:
   - Click "Upload New"
   - Select a .glb file
   - Fill in asset details
   - Click "Save Asset"

2. **Browse Library**:
   - Use search bar to find assets
   - Click category filters
   - Scroll through asset list

3. **View 3D Model**:
   - Click any asset card
   - Model loads in center viewer
   - Use hand gestures to interact
   - Click "Reset View" if needed

4. **Manage Assets**:
   - Hover over asset cards
   - Click trash icon to delete
   - Confirm deletion

## Technical Notes

- **Storage Limit**: ~5MB per asset (browser limitation)
- **Supported Format**: GLB (Binary GLTF) only
- **Camera Required**: For hand tracking features
- **Modern Browser**: Chrome/Edge recommended
- **Responsive**: Optimized for desktop (1280px+)

## Future Enhancements (Ideas)

- [ ] Thumbnail generation for faster preview
- [ ] Bulk upload support
- [ ] Export/Import library data
- [ ] Collaborative sharing (using shared storage)
- [ ] Advanced filters (date range, size)
- [ ] Asset versioning
- [ ] Collections/Folders
- [ ] Annotations on 3D models
- [ ] Screenshot capture
- [ ] Print-ready export

## Deployment

The app is designed for Vercel deployment with:
- Vite build system
- React 18.x compatibility
- Tailwind CSS for styling
- MediaPipe for hand tracking
- Three.js/React Three Fiber for 3D rendering
