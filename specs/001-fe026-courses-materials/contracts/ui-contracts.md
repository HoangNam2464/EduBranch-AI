# UI Component Contracts: FE-023 Target Mapping [FE-026]

**Reference**: FE-023 (EBA-86) target structure on branch `refactor/frontend-structure` (FE-023 target (expected; not on develop `273f1fc`; verified by T028)); every path from it is an expectation verified by T028 after merge.  
**Design System Root**: `frontend/src/components/ds/`  
**Feedback Components Root**: `frontend/src/components/feedback/`  
**Page Components**:
- `frontend/src/pages/courses/CoursesPage.tsx`
- `frontend/src/pages/materials/MaterialsPage.tsx`
- `frontend/src/pages/materials/RagSourceInspectorPage.tsx`

---

## 1. Design System Primitives (`src/components/ds/`)

### 1.1. `CourseCard` (`src/components/ds/CourseCard.tsx`)
Used in frame 02.1 left column list.
```typescript
export interface CourseCardProps {
  id: string;
  name: string;
  courseCode?: string;
  coverImageUrl?: string | null;
  materialCount: number;
  caseCount: number;
  readyMaterialCount?: number;
  noteText?: string;
  noteTone?: 'neutral' | 'warning' | 'info';
  isSelected?: boolean;
  onClick?: () => void;
}
```

### 1.2. `CourseOverview` (`src/components/ds/CourseOverview.tsx`)
Used in frame 02.1 right column detail panel.
```typescript
export interface CourseOverviewProps {
  course: {
    id: string;
    name: string;
    courseCode?: string;
    description?: string;
    coverImageUrl?: string | null;
    is_active: boolean;
    materialCount: number;
    caseCount: number;
    createdAt: string;
    updatedAt: string;
  };
  onEditCourse: () => void;
  onRemoveCourse: () => void; /* BLOCKED-ON-C1: course removal action (C1-A delete vs C1-B soft archive) */
  onNavigateToMaterials: () => void;
}
```

### 1.3. `Dialog` (`src/components/ds/Dialog.tsx`)
Used for Course Create/Edit modal (02.2), Course Removal dialog (02.3, BLOCKED-ON-C1: C1-A delete vs C1-B soft archive), Upload modal (02.5), Material Delete dialog (02.6).
```typescript
export type DialogType = 'standard' | 'confirm' | 'danger';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: DialogType;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  isConfirmLoading?: boolean;
  isConfirmDisabled?: boolean;
}
```

### 1.4. `ProcessingBadge` (`src/components/ds/ProcessingBadge.tsx`)
Used in Material table (02.4) to represent RAG status.
```typescript
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ProcessingBadgeProps {
  status: ProcessingStatus;
  progressPercent?: number; // Used when status === 'PROCESSING'
  chunkCount?: number;      // Used when status === 'COMPLETED'
}
```

### 1.5. `MetricCard` (`src/components/ds/MetricCard.tsx`)
Used in RAG Source Inspector (02.7) header.
```typescript
export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
}
```

---

## 2. Feedback States Primitives (`src/components/feedback/`)

### 2.1. `EmptyState` (`src/components/feedback/EmptyState.tsx`)
Rendered **ONLY** when an API returns HTTP 200 OK with an empty dataset (e.g. 0 courses, 0 materials, or 0 chunks). Never rendered for errors or missing endpoints (Missing API ≠ empty data).
```typescript
export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

### 2.2. `ErrorState` (`src/components/feedback/ErrorState.tsx`)
Rendered when an API request fails, an endpoint is missing (HTTP 404), unauthorized/forbidden (HTTP 403), server error (HTTP 5xx), or network drops. Displays the real failure reason with a retry action where sensible.
```typescript
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}
```

### 2.3. Skeletons (`src/components/feedback/Skeleton.tsx`)
Used during data fetching states.
- `CourseListSkeleton`: Renders placeholder cards in `CoursesPage.tsx`.
- `SkeletonRegion`: Renders table placeholder rows in `MaterialsPage.tsx`.

---

## 3. Router Path Contracts (`src/routes/paths.ts`)

| Logical Constant | Pattern | Helper Invocation |
|---|---|---|
| `PATHS.LECTURER.COURSES` | `/lecturer/courses` | `PATHS.LECTURER.COURSES` |
| `PATHS.LECTURER.COURSE_MATERIALS` | `/lecturer/courses/:courseId/materials` | `buildPath(PATHS.LECTURER.COURSE_MATERIALS, { courseId })` |
| `PATHS.LECTURER.MATERIAL_SOURCES` | `/lecturer/courses/:courseId/materials/:materialId/rag` | `buildPath(PATHS.LECTURER.MATERIAL_SOURCES, { courseId, materialId })` |
