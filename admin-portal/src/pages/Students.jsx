import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Star,
  Users,
  CheckCircle2,
  BookOpen,
  Crown,
  UserCircle
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import AddStudentModal from '../components/AddStudentModal';
import '../styles/GlobalStyles.css';

const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString();
};

const getDerivedState = (student) => {
  if (student.status === 'dropped') return 'dropped';
  if (!student.Batch) return 'unassigned';

  const end = toDateOnly(student.Batch.end_date);
  const today = toDateOnly(new Date());
  if (end && today && today >= end) return 'course_completed';
  return 'enrolled';
};

const stateLabel = {
  enrolled: 'Enrolled',
  course_completed: 'Course Completed',
  dropped: 'Dropped',
  unassigned: 'Unassigned'
};

const stateStyle = {
  enrolled: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '#3b82f6' },
  course_completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '#10b981' },
  dropped: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '#ef4444' },
  unassigned: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: '#94a3b8' }
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ name: '', email: '', mobile_no: '', batch_id: '', course_id: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [rowSavingId, setRowSavingId] = useState(null);
  const [batchDrafts, setBatchDrafts] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, batchesRes, coursesRes] = await Promise.all([
        api.get('/students'),
        api.get('/lms/batches'),
        api.get('/lms/courses')
      ]);
      setStudents(studentsRes.data || []);
      setBatches(batchesRes.data || []);
      setCourses(coursesRes.data || []);

      const drafts = {};
      (studentsRes.data || []).forEach((student) => {
        drafts[student.id] = student.batch_id || '';
      });
      setBatchDrafts(drafts);
    } catch (error) {
      console.error('Failed to fetch students data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const enrichedStudents = useMemo(() => {
    return students.map((student) => {
      const derivedState = student.derived_state || getDerivedState(student);
      const isPremium = (student.plan_type || '').toLowerCase() === 'premium';
      return {
        ...student,
        derivedState,
        isPremium,
        completionDate: derivedState === 'course_completed' ? student.Batch?.end_date : null
      };
    });
  }, [students]);

  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((student) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        (student.User?.name || '').toLowerCase().includes(query) ||
        (student.User?.email || '').toLowerCase().includes(query) ||
        (student.mobile_no || '').toLowerCase().includes(query);

      const matchBatch = batchFilter === 'all' ? true : String(student.batch_id || '') === batchFilter;
      const matchCourse = courseFilter === 'all' ? true : String(student.Batch?.course_id || '') === courseFilter;
      const matchState = stateFilter === 'all' ? true : student.derivedState === stateFilter;
      const matchPremium = premiumFilter === 'all' ? true : (premiumFilter === 'premium' ? student.isPremium : !student.isPremium);

      return matchSearch && matchBatch && matchCourse && matchState && matchPremium;
    });
  }, [enrichedStudents, searchTerm, batchFilter, courseFilter, stateFilter, premiumFilter]);

  const metrics = useMemo(() => ({
    total: enrichedStudents.length,
    enrolled: enrichedStudents.filter((s) => s.derivedState === 'enrolled').length,
    completed: enrichedStudents.filter((s) => s.derivedState === 'course_completed').length,
    premium: enrichedStudents.filter((s) => s.isPremium).length
  }), [enrichedStudents]);

  const handleSaveBatch = async (student) => {
    const batchId = batchDrafts[student.id] || null;
    setRowSavingId(student.id);
    try {
      const response = await api.patch(`/students/${student.id}/management`, { batch_id: batchId || null });
      setStudents((prev) => prev.map((item) => (item.id === student.id ? response.data : item)));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to change batch');
    } finally {
      setRowSavingId(null);
    }
  };

  const handleStatusChange = async (student, status) => {
    setRowSavingId(student.id);
    try {
      const response = await api.patch(`/students/${student.id}/management`, { status });
      setStudents((prev) => prev.map((item) => (item.id === student.id ? response.data : item)));
      if (selectedStudent?.id === student.id) setSelectedStudent(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to change student status');
    } finally {
      setRowSavingId(null);
    }
  };

  const handleAddStudent = async (submissionData) => {
    setIsAdding(true);
    try {
      const response = await api.post('/students', submissionData);
      setStudents([response.data.student, ...students]);
      setIsAddModalOpen(false);
      fetchData(); // refresh to get enriched data
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add student');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Detailed Student Management</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Batch-based progress, premium tracking, and profile-level management</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Add New Student</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1rem' }}><Users size={16} /><h3 style={{ margin: '0.4rem 0 0 0' }}>{metrics.total}</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Students</p></div>
        <div className="glass-morphism" style={{ padding: '1rem' }}><BookOpen size={16} /><h3 style={{ margin: '0.4rem 0 0 0' }}>{metrics.enrolled}</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Currently Enrolled</p></div>
        <div className="glass-morphism" style={{ padding: '1rem' }}><CheckCircle2 size={16} /><h3 style={{ margin: '0.4rem 0 0 0' }}>{metrics.completed}</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Course Completed</p></div>
        <div className="glass-morphism" style={{ padding: '1rem' }}><Crown size={16} /><h3 style={{ margin: '0.4rem 0 0 0' }}>{metrics.premium}</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Premium PTE</p></div>
      </div>

      <div className="glass-morphism" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: '0.8rem', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone"
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
          />
        </div>

        <select className="glass-input" value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={{ appearance: 'auto', padding: '0.7rem' }}>
          <option value="all">All Batches</option>
          {batches.map((batch) => <option key={batch.id} value={String(batch.id)}>{batch.code}</option>)}
        </select>

        <select className="glass-input" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={{ appearance: 'auto', padding: '0.7rem' }}>
          <option value="all">All Courses</option>
          {courses.map((course) => <option key={course.id} value={String(course.id)}>{course.title}</option>)}
        </select>

        <select className="glass-input" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={{ appearance: 'auto', padding: '0.7rem' }}>
          <option value="all">All States</option>
          <option value="enrolled">Enrolled</option>
          <option value="course_completed">Course Completed</option>
          <option value="dropped">Dropped</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <select className="glass-input" value={premiumFilter} onChange={(e) => setPremiumFilter(e.target.value)} style={{ appearance: 'auto', padding: '0.7rem' }}>
          <option value="all">All Plans</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
      </div>

      <div className="glass-morphism" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Contact</th>
              <th style={{ padding: '1rem' }}>Course</th>
              <th style={{ padding: '1rem' }}>Batch</th>
              <th style={{ padding: '1rem' }}>Enrollment</th>
              <th style={{ padding: '1rem' }}>Completion</th>
              <th style={{ padding: '1rem' }}>State</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const state = student.derivedState;
              const style = stateStyle[state];
              return (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {student.User?.name}
                      {student.isPremium && <Star size={14} color="#facc15" fill="#facc15" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: STU-{student.id}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={13} />{student.User?.email || 'N/A'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}><Phone size={13} />{student.mobile_no || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>{student.Batch?.Course?.title || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>{student.Batch?.code || 'Unassigned'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={13} />{formatDate(student.enrollment_date)}</div></td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>{state === 'course_completed' ? formatDate(student.completionDate) : 'In Progress'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '12px', background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                      {stateLabel[state]}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <select className="glass-input" value={batchDrafts[student.id] || ''} onChange={(e) => setBatchDrafts({ ...batchDrafts, [student.id]: e.target.value })} style={{ appearance: 'auto', padding: '0.4rem', minWidth: '140px' }}>
                          <option value="">Unassign</option>
                          {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.code}</option>)}
                        </select>
                        <button className="btn-secondary" onClick={() => handleSaveBatch(student)} disabled={rowSavingId === student.id} style={{ padding: '0.4rem 0.7rem' }}>
                          {rowSavingId === student.id ? <Loader2 size={14} className="animate-spin" /> : 'Save Batch'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-secondary" onClick={() => { setSelectedStudent(student); setIsProfileModalOpen(true); }} style={{ padding: '0.4rem 0.7rem' }}>Profile</button>
                        {student.status === 'dropped' ? (
                          <button className="btn-secondary" onClick={() => handleStatusChange(student, 'active')} style={{ padding: '0.4rem 0.7rem', borderColor: '#10b981', color: '#10b981' }}>Reactivate</button>
                        ) : (
                          <button className="btn-secondary" onClick={() => handleStatusChange(student, 'dropped')} style={{ padding: '0.4rem 0.7rem', borderColor: '#ef4444', color: '#ef4444' }}>Mark Dropped</button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add New Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
        courses={courses}
        batches={batches}
        isAdding={isAdding}
      />

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Student Profile">
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.3rem' }}>
            <div className="glass-morphism" style={{ padding: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCircle size={18} /> {selectedStudent.User?.name}
                {selectedStudent.isPremium && <Star size={14} color="#facc15" fill="#facc15" />}
              </h3>
              <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{selectedStudent.User?.email}</p>
            </div>

            <div className="glass-morphism" style={{ padding: '1rem' }}>
              <h4 style={{ marginTop: 0 }}>Enrollment Details</h4>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Enrollment Date:</strong> {formatDate(selectedStudent.enrollment_date)}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Course:</strong> {selectedStudent.Batch?.Course?.title || 'N/A'}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Batch:</strong> {selectedStudent.Batch?.code || 'Unassigned'}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Batch End Date:</strong> {formatDate(selectedStudent.Batch?.end_date)}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Current State:</strong> {stateLabel[selectedStudent.derivedState || getDerivedState(selectedStudent)]}</p>
            </div>

            <div className="glass-morphism" style={{ padding: '1rem' }}>
              <h4 style={{ marginTop: 0 }}>Premium PTE Plan</h4>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Plan:</strong> {(selectedStudent.plan_type || 'free').toUpperCase()}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Premium Start:</strong> {formatDate(selectedStudent.premium_start_date)}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Premium Expiry:</strong> {formatDate(selectedStudent.premium_expiry_date)}</p>
            </div>

            <div className="glass-morphism" style={{ padding: '1rem' }}>
              <h4 style={{ marginTop: 0 }}>Personal Data</h4>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Mobile:</strong> {selectedStudent.mobile_no || 'N/A'}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Current Address:</strong> {selectedStudent.current_address || 'N/A'}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Permanent Address:</strong> {selectedStudent.permanent_address || 'N/A'}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Father Name:</strong> {selectedStudent.father_name || 'N/A'}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Mother Name:</strong> {selectedStudent.mother_name || 'N/A'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Students;
