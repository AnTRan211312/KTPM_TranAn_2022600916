# Design Document

## Overview

Thiết kế này sửa lỗi hiển thị trạng thái công việc và ngăn chặn nộp CV cho công việc đã hết hạn. Giải pháp bao gồm việc tạo utility function để kiểm tra trạng thái công việc, cập nhật UI components để hiển thị trạng thái chính xác, và thêm validation logic để ngăn chặn hành động không hợp lệ.

## Architecture

### Component Structure

```
utils/
  └── jobStatusHelper.ts (NEW) ✅ COMPLETED
      - getJobStatus()
      - isJobExpired()

pages/client/job-page/
  └── JobGrid.tsx (MODIFIED) ✅ COMPLETED
      - Sử dụng getJobStatus() để hiển thị trạng thái

pages/client/job-details-page/
  ├── index.tsx (MODIFIED) ✅ COMPLETED
  │   - Truyền job status xuống ApplySection
  └── ApplySection.tsx (MODIFIED) ✅ COMPLETED
      - Kiểm tra isJobExpired() trước khi cho phép nộp CV
      - Disable/hide buttons nếu hết hạn
```

## Components and Interfaces

### 1. Job Status Utility (jobStatusHelper.ts)

**Location**: `TalentBridge-Frontend/src/utils/jobStatusHelper.ts`

**Functions**:

```typescript
interface JobStatusResult {
  isExpired: boolean;
  isActive: boolean;
  statusText: string;
  statusColor: string; // Tailwind classes
}

function getJobStatus(job: Job): JobStatusResult
function isJobExpired(endDate: string): boolean
```

**Logic**:
- `isJobExpired()`: So sánh ngày hiện tại với endDate (chỉ so sánh ngày, không so sánh giờ)
- `getJobStatus()`: Kết hợp kiểm tra expired và active field để trả về trạng thái đầy đủ

**Status Priority**:
1. Nếu `active === false` → "Đã đóng" (red)
2. Nếu `isExpired === true` → "Hết hạn" (red)
3. Nếu `active === true && !isExpired` → "Đang tuyển" (green)

### 2. JobGrid Component Updates

**File**: `TalentBridge-Frontend/src/pages/client/job-page/JobGrid.tsx`

**Changes**:
- Import `getJobStatus` từ utility
- Thay thế logic hiện tại:
  ```typescript
  // OLD
  {job.active ? "Đang tuyển" : "Đã đóng"}
  
  // NEW
  const jobStatus = getJobStatus(job);
  {jobStatus.statusText}
  ```
- Áp dụng màu động từ `jobStatus.statusColor`

### 3. ApplySection Component Updates

**File**: `TalentBridge-Frontend/src/pages/client/job-details-page/ApplySection.tsx`

**New Props**:
```typescript
interface ApplySectionProps {
  jobId: number;
  jobTitle: string;
  endDate: string; // NEW
  isActive: boolean; // NEW
}
```

**Changes**:
- Thêm kiểm tra `isJobExpired(endDate)` trong `handleApplyClick()`
- Nếu expired, hiển thị toast error và return sớm
- Disable cả 2 apply buttons (static và floating) nếu job expired hoặc không active
- Thêm visual indicator (màu xám, cursor not-allowed) cho disabled state

### 4. Job Details Page Updates

**File**: `TalentBridge-Frontend/src/pages/client/job-details-page/index.tsx`

**Changes**:
- Truyền thêm props `endDate` và `isActive` xuống ApplySection:
  ```typescript
  <ApplySection 
    jobId={job.id} 
    jobTitle={job.name}
    endDate={job.endDate}
    isActive={job.active}
  />
  ```

## Data Models

Không có thay đổi về data models. Sử dụng interface `Job` hiện có:

```typescript
interface Job {
  id: number;
  name: string;
  endDate: string; // ISO date string
  active: boolean;
  // ... other fields
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Expiration check consistency
*For any* job with an endDate in the past, `isJobExpired(job.endDate)` should return `true`, and `getJobStatus(job).isExpired` should also be `true`
**Validates: Requirements 1.1, 3.3**

### Property 2: Status text matches expiration state
*For any* expired job (where current date > endDate), `getJobStatus(job).statusText` should be "Hết hạn" and `statusColor` should contain "red"
**Validates: Requirements 1.2**

### Property 3: Active jobs display correctly
*For any* job where `active === true` and `isExpired === false`, `getJobStatus(job).statusText` should be "Đang tuyển" and `statusColor` should contain "green"
**Validates: Requirements 1.3**

### Property 4: Inactive jobs override expiration
*For any* job where `active === false`, regardless of endDate, `getJobStatus(job).statusText` should be "Đã đóng" and `statusColor` should contain "red"
**Validates: Requirements 1.4**

### Property 5: Apply modal blocked for expired jobs
*For any* expired job, attempting to open the apply modal should result in an error toast and the modal should not open
**Validates: Requirements 2.1, 2.2**

### Property 6: Apply buttons disabled for expired jobs
*For any* expired job or inactive job, the apply buttons should be disabled or hidden on the job details page
**Validates: Requirements 2.3**

## Error Handling

### Client-Side Validation Errors

1. **Expired Job Application Attempt**
   - **Trigger**: User clicks apply button on expired job
   - **Response**: Display toast error "Công việc này đã hết hạn nộp CV"
   - **Action**: Prevent modal from opening

2. **Invalid Date Format**
   - **Trigger**: Job endDate is not a valid ISO date string
   - **Response**: Log error to console, treat as expired for safety
   - **Action**: Display job as "Hết hạn"

### Edge Cases

1. **Job expires while user is viewing**: User may see "Đang tuyển" but when clicking apply, it's expired
   - **Solution**: Check expiration again in `handleApplyClick()`

2. **Timezone differences**: Server and client may be in different timezones
   - **Solution**: Use date-only comparison (ignore time component)

## Testing Strategy

### Unit Tests

**File**: `TalentBridge-Frontend/src/utils/jobStatusHelper.test.ts`

Test cases:
1. `isJobExpired()` returns true for past dates
2. `isJobExpired()` returns false for future dates
3. `isJobExpired()` returns false for today's date
4. `getJobStatus()` returns correct status for expired + active job
5. `getJobStatus()` returns correct status for not expired + active job
6. `getJobStatus()` returns correct status for inactive job (regardless of date)
7. `getJobStatus()` returns correct color classes

### Component Tests

**JobGrid Component**:
- Verify expired jobs show "Hết hạn" with red color
- Verify active non-expired jobs show "Đang tuyển" with green color
- Verify inactive jobs show "Đã đóng" with red color

**ApplySection Component**:
- Verify apply buttons are disabled for expired jobs
- Verify error toast appears when trying to apply to expired job
- Verify apply modal opens for valid jobs
- Verify apply buttons are enabled for non-expired active jobs

### Integration Tests

1. **End-to-end flow**: Navigate to expired job → Attempt to apply → Verify error message
2. **Status consistency**: Verify JobGrid and JobDetails show same status for same job
3. **Real-time expiration**: Mock system time to test job expiring during user session

### Testing Framework

- **Unit Tests**: Vitest
- **Component Tests**: Vitest + React Testing Library
- **Date Mocking**: `vi.setSystemTime()` from Vitest

## Implementation Notes

1. **Date Comparison**: Use `new Date().setHours(0,0,0,0)` to compare dates without time component
2. **Tailwind Classes**: Use conditional classes for status colors:
   - Green: `bg-green-100 text-green-700`
   - Red: `bg-red-100 text-red-700`
3. **Accessibility**: Ensure disabled buttons have proper aria-labels explaining why they're disabled
4. **Performance**: `getJobStatus()` is a pure function, can be memoized if needed
