# Gemini AI Integration for Notice Management

This integration enhances the CampusMate notice creation system with Google Gemini AI to automatically process and structure notice content from various sources.

## Features

### 🤖 AI-Powered Content Processing
- **Text Enhancement**: Gemini analyzes admin-provided text content and creates structured, comprehensive notices
- **Image Analysis**: Extracts text and insights from uploaded images (posters, announcements, etc.)
- **PDF Processing**: Notes PDF attachments and suggests users refer to them for detailed information
- **Smart Categorization**: Automatically suggests appropriate categories, priorities, and targeting based on content

### 📝 Structured Output
The AI generates notices in the exact format required by the Notice model:
- Title (max 200 chars)
- Content (max 5000 chars)
- Summary (max 500 chars)
- Category (from predefined list)
- Priority (Low, Normal, High, Urgent)
- Type (Announcement, Circular, Notice, Alert, Reminder)
- Targeting information (roles, departments, etc.)
- Tags and keywords for searchability
- External links if mentioned in content

## How It Works

### 1. Input Processing
When an admin creates a notice, the system processes:
```javascript
{
  textData: {
    title: "Optional title",
    content: "Main content text",
    category: "Suggested category",
    priority: "Suggested priority",
    // ... other fields
  },
  files: [
    // Uploaded images and PDFs
  ]
}
```

### 2. Gemini AI Analysis
- Sends all content (text + images) to Gemini API
- Uses specialized prompt for university campus context
- Analyzes content for appropriate categorization and targeting

### 3. Structured Response
Returns validated JSON matching the Notice model schema with enhanced content.

## API Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Fallback Behavior
If Gemini AI processing fails:
- System falls back to original user-provided content
- Notice is still created successfully
- Admin gets notification about AI enhancement failure

## Usage Examples

### Text-Only Notice
```javascript
POST /api/notices
Content-Type: application/json

{
  "title": "Workshop Announcement",
  "content": "AI and Machine Learning workshop for CS students on Dec 15",
  "targeting": {
    "departments": ["Computer Science and Engineering"],
    "roles": ["student"]
  }
}
```

### With Image Upload
```javascript
POST /api/notices
Content-Type: multipart/form-data

// Form data:
title: "Event Poster"
content: "Please check the attached poster for details"
files: [event_poster.jpg]
targeting[departments]: ["Computer Science and Engineering"]
targeting[roles]: ["student", "teacher"]
```

## Supported File Types

### Images
- **Formats**: JPG, PNG, GIF, WebP
- **Processing**: Text extraction, content analysis, event detection
- **Max Size**: As configured in file upload settings

### PDFs
- **Processing**: File notation and reference suggestion
- **Note**: Currently notes PDF presence; future versions may include text extraction

## API Response

### Success Response
```json
{
  "success": true,
  "data": {
    "title": "AI-enhanced title",
    "content": "AI-processed and structured content",
    "category": "Workshop",
    "priority": "Normal",
    "targeting": {
      "departments": ["Computer Science and Engineering"],
      "roles": ["student"]
    },
    "tags": ["AI", "workshop", "machine-learning"],
    "keywords": ["artificial intelligence", "workshop", "students"],
    // ... other fields
  },
  "message": "Notice created and published successfully with AI enhancement"
}
```

### Fallback Response (if AI fails)
```json
{
  "success": true,
  "data": {
    // Original user content
  },
  "message": "Notice created and published successfully (AI enhancement failed, used original content)"
}
```

## Testing

### Run Integration Test
```bash
node test_gemini_integration.js
```

### Manual Testing
Use the existing notice creation endpoints with various content types to test AI enhancement.

## Error Handling

### Common Issues
1. **Invalid API Key**: Check GEMINI_API_KEY environment variable
2. **Network Timeout**: AI processing has 30-second timeout, then falls back
3. **Invalid Response**: System validates and sanitizes all AI responses
4. **File Access Issues**: Checks file existence before processing

### Monitoring
- All Gemini AI interactions are logged
- Fallback usage is tracked
- Processing time metrics available

## Security Considerations

### API Key Management
- Store API key in environment variables
- Never commit API key to version control
- Use different keys for development/production

### Content Validation
- All AI responses are validated against Notice model schema
- Input sanitization prevents injection attacks
- File upload validation prevents malicious files

## Performance

### Optimization
- Async processing doesn't block notice creation
- Fallback ensures system availability
- Image compression recommended for faster processing

### Limits
- Maximum 5MB per image file
- Processing timeout: 30 seconds
- Fallback to original content if AI fails

## Future Enhancements

### Planned Features
1. **PDF Text Extraction**: Full PDF content analysis
2. **Multi-language Support**: Content translation
3. **Sentiment Analysis**: Tone and urgency detection
4. **Smart Scheduling**: Optimal delivery time suggestions
5. **Batch Processing**: Multiple notices from single source

### Integration Opportunities
1. **Email Enhancement**: AI-generated email summaries
2. **Push Notifications**: Smart notification content
3. **Analytics**: AI-powered engagement insights
4. **Calendar Integration**: Event extraction and scheduling

## Troubleshooting

### Common Problems

#### "AI enhancement failed"
- Check internet connectivity
- Verify API key validity
- Check Gemini API quota/billing

#### "No valid JSON found in response"
- Gemini response parsing issue
- System automatically falls back to original content

#### "File processing error"
- File format not supported
- File size too large
- File corruption

### Debug Mode
Set environment variable for detailed logging:
```env
DEBUG_GEMINI=true
```

## Contributing

When modifying the Gemini integration:
1. Update `utils/geminiProcessor.js` for core logic
2. Modify `controllers/notice.js` for API integration
3. Add tests for new features
4. Update this documentation

## License

This integration is part of the CampusMate.ai project and follows the same license terms.
