import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateTranscript = (studentData, academicRecords) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Defence Command and Staff College', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Academic Transcript', 105, 30, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Student Name: ${studentData.profiles?.full_name || 'N/A'}`, 20, 50);
  doc.text(`Student ID: ${studentData.student_id || 'N/A'}`, 20, 58);
  doc.text(`Email: ${studentData.profiles?.email || 'N/A'}`, 20, 66);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 74);

  const tableData = academicRecords.map((record) => [
    record.enrollment?.course?.course_code || '',
    record.enrollment?.course?.course_name || '',
    record.enrollment?.course?.credits || '',
    record.grade || '',
    record.grade_points?.toFixed(2) || '',
  ]);

  doc.autoTable({
    startY: 85,
    head: [['Course Code', 'Course Name', 'Credits', 'Grade', 'Grade Points']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
  });

  const validRecords = academicRecords.filter((r) => r.grade_points != null);
  const totalPoints = validRecords.reduce((sum, record) => {
    const credits = record.enrollment?.course?.credits || 0;
    return sum + record.grade_points * credits;
  }, 0);

  const totalCredits = validRecords.reduce((sum, record) => {
    return sum + (record.enrollment?.course?.credits || 0);
  }, 0);

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total Credits: ${totalCredits}`, 20, finalY);
  doc.text(`GPA: ${gpa}`, 20, finalY + 8);

  doc.save(`transcript_${studentData.student_id}_${Date.now()}.pdf`);
};

export const generateCertificate = (studentData, courseData) => {
  const doc = new jsPDF('landscape');

  doc.setFontSize(30);
  doc.text('Certificate of Completion', 148, 40, { align: 'center' });

  doc.setFontSize(16);
  doc.text('This is to certify that', 148, 70, { align: 'center' });

  doc.setFontSize(24);
  doc.text(studentData.profiles?.full_name || 'Student Name', 148, 90, { align: 'center' });

  doc.setFontSize(16);
  doc.text('has successfully completed the course', 148, 110, { align: 'center' });

  doc.setFontSize(20);
  doc.text(courseData.course_name || 'Course Name', 148, 130, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Course Code: ${courseData.course_code || 'N/A'}`, 148, 145, { align: 'center' });
  doc.text(`Credits: ${courseData.credits || 'N/A'}`, 148, 155, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Defence Command and Staff College', 148, 175, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 148, 185, { align: 'center' });

  doc.save(`certificate_${studentData.student_id}_${courseData.course_code}_${Date.now()}.pdf`);
};
