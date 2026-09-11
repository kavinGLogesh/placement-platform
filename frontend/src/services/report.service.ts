import { apiClient } from '../api/axios.client.js';
import {
  StudentPerformanceReportDto,
  AssessmentResultReportDto,
  DepartmentPerformanceReportDto,
  TopicPerformanceReportDto,
  QuestionAnalysisReportDto,
  CodingAssessmentReportDto,
  PlacementFunnelReportDto,
  StudentOwnPerformanceReportDto,
  ExportFormat,
} from '../types/report.types.js';

export class ReportService {
  // 1. Student Performance Report
  async getStudentReport(params: Record<string, any> = {}): Promise<StudentPerformanceReportDto> {
    const res = await apiClient.get('/reports/students', { params });
    return res.data.data;
  }

  // 2. Assessment Result Report
  async getAssessmentReport(params: Record<string, any> = {}): Promise<AssessmentResultReportDto> {
    const res = await apiClient.get('/reports/assessments', { params });
    return res.data.data;
  }

  // 3. Department Performance Report
  async getDepartmentReport(params: Record<string, any> = {}): Promise<DepartmentPerformanceReportDto> {
    const res = await apiClient.get('/reports/departments', { params });
    return res.data.data;
  }

  // 4. Topic Performance Report
  async getTopicReport(params: Record<string, any> = {}): Promise<TopicPerformanceReportDto> {
    const res = await apiClient.get('/reports/topics', { params });
    return res.data.data;
  }

  // 5. Question Analysis Report
  async getQuestionReport(params: Record<string, any> = {}): Promise<QuestionAnalysisReportDto> {
    const res = await apiClient.get('/reports/questions', { params });
    return res.data.data;
  }

  // 6. Coding Assessment Report
  async getCodingReport(params: Record<string, any> = {}): Promise<CodingAssessmentReportDto> {
    const res = await apiClient.get('/reports/coding', { params });
    return res.data.data;
  }

  // 7. Placement Funnel Report
  async getFunnelReport(params: Record<string, any> = {}): Promise<PlacementFunnelReportDto> {
    const res = await apiClient.get('/reports/funnel', { params });
    return res.data.data;
  }

  // 8. Student Own Performance Report
  async getStudentOwnReport(params: Record<string, any> = {}): Promise<StudentOwnPerformanceReportDto> {
    const res = await apiClient.get('/reports/student/me', { params });
    return res.data.data;
  }

  // Download export for Admin reports
  async downloadReport(
    reportType: string,
    format: ExportFormat,
    filters: Record<string, any> = {}
  ): Promise<void> {
    const params = { ...filters, format };

    if (format === 'html') {
      const res = await apiClient.get(`/reports/${reportType}/export`, {
        params,
        responseType: 'text',
      });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(res.data);
        printWindow.document.close();
      }
      return;
    }

    const res = await apiClient.get(`/reports/${reportType}/export`, {
      params,
      responseType: 'blob',
    });

    this.triggerDownload(res.data, `${reportType}-report.${format}`);
  }

  // Download export for Student Own report
  async downloadStudentOwnReport(
    format: ExportFormat,
    filters: Record<string, any> = {}
  ): Promise<void> {
    const params = { ...filters, format };

    if (format === 'html') {
      const res = await apiClient.get('/reports/student/me/export', {
        params,
        responseType: 'text',
      });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(res.data);
        printWindow.document.close();
      }
      return;
    }

    const res = await apiClient.get('/reports/student/me/export', {
      params,
      responseType: 'blob',
    });

    this.triggerDownload(res.data, `student-performance-transcript.${format}`);
  }

  private triggerDownload(data: BlobPart, defaultFilename: string): void {
    const blob = new Blob([data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportService = new ReportService();
