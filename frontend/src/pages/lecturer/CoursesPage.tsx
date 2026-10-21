import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { Course } from "../../types";
import {
  PageHeader, Button, Card, EmptyState, Alert, Modal, Spinner
} from "../../components/ui";

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", courseCode: "" });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setModalError("Tên khóa học không được để trống.");
      return;
    }
    try {
      setCreating(true);
      setModalError(null);
      const newCourse = await courseService.createCourse({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        courseCode: form.courseCode?.trim() || undefined,
      });
      setCourses((prev) => [newCourse, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", courseCode: "" });
    } catch (err: any) {
      setModalError(err?.response?.data?.message || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="My Courses"
        description="Manage your university courses and teaching materials."
        actions={
          <Button
            onClick={() => {
              setModalError(null);
              setShowCreate(true);
            }}
            id="btn-create-course"
          >
            + New Course
          </Button>
        }
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to start uploading teaching materials and generating case studies."
          action={
            <Button
              onClick={() => {
                setModalError(null);
                setShowCreate(true);
              }}
            >
              Create First Course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer" padding>
              <div
                className="flex h-full flex-col"
                onClick={() => navigate(`/lecturer/courses/${course.id}/materials`)}
                id={`course-card-${course.id}`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{course.name}</h3>
                  {course.courseCode && (
                    <span className="ml-2 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {course.courseCode}
                    </span>
                  )}
                </div>
                {course.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                )}
                <div className="mt-auto pt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/lecturer/courses/${course.id}/materials`);
                    }}
                  >
                    Materials
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/lecturer/courses/${course.id}/cases`);
                    }}
                  >
                    Cases
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setModalError(null);
        }}
        title="Create New Course"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreate(false);
                setModalError(null);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={creating} id="btn-submit-course">
              Create
            </Button>
          </>
        }
      >
        {modalError && <Alert variant="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name *</label>
            <input
              id="input-course-name"
              disabled={creating}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (modalError) setModalError(null);
              }}
              placeholder="e.g. Business Strategy Analysis"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Code</label>
            <input
              id="input-course-code"
              disabled={creating}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={form.courseCode}
              onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
              placeholder="e.g. BUS301"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="input-course-description"
              disabled={creating}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional course description"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
