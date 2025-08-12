import { saveAs } from 'file-saver';

export const exportReport = async (url: string, format: 'pdf' | 'excel', filename: string) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        const expectedType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        if (!contentType?.includes(expectedType)) {
            throw new Error(`Invalid content type: ${contentType}. Expected: ${expectedType}`);
        }

        const blob = await response.blob();
        const extension = format === 'pdf' ? '.pdf' : '.xlsx';
        saveAs(blob, `${filename}${extension}`);
    } catch (error) {
        console.error('Error exporting report:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to export report: ${error.message}`);
        }
        throw new Error('Failed to export report');
    }
};