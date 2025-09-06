const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini AI with API key
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD2QeeIdDk9kCNiYJLMfFpAjcKbl5nqsAk';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Process uploaded files and text content using Gemini AI
 * @param {Object} params - Processing parameters
 * @param {Array} params.files - Array of uploaded files
 * @param {Object} params.textData - Text data from request body
 * @returns {Object} - Structured notice data
 */
async function processNoticeWithGemini(params) {
  try {
    const { files = [], textData = {} } = params;
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Prepare content for Gemini
    const parts = [];
    
    // Add text prompt
    const prompt = `
You are an intelligent assistant for a university campus notice management system in Bangladesh. 
Analyze the provided content (text, images, PDFs) and create a structured notice in JSON format.

IMPORTANT LANGUAGE HANDLING:
- Content may be in English or Bangla (Bengali) language
- If images or PDFs contain Bangla text, extract and translate it to English for structured fields
- Preserve original Bangla content in the content field when applicable
- Sessions may be written in Bangla format (e.g., ২০২০-২১, ২০২১-২২) - convert to standard format (2020-21, 2021-22)
- Extract all relevant information from PDF documents including text, tables, and structured data

CRITICAL INSTRUCTION: If the user has provided specific targeting data, delivery settings, tags, or external links, you MUST preserve them exactly as given. Only enhance or add missing information, do not replace existing user data.

TARGETING DATA EXTRACTION FROM IMAGES AND PDFs:
When analyzing images and PDFs, look for:
- Department names in English or Bangla (কম্পিউটার বিজ্ঞান ও প্রকৌশল = Computer Science and Engineering)
- Session information (৪র্থ বর্ষ = 4th year, ২০২০-২১ = 2020-21)
- Blood group requirements (এ+, বি+, ও+ etc.)
- Gender specifications (ছেলে/মেয়ে = male/female)
- Year/semester information
- Target audience (ছাত্র/ছাত্রী = students, শিক্ষক = teachers)
- Event details, dates, deadlines
- Registration requirements or eligibility criteria

DEPARTMENT MAPPING (Bangla to English):
- বাংলা ভাষা ও সাহিত্য = Bangla Language and Literature
- ইংরেজি ভাষা ও সাহিত্য = English Language and Literature  
- কম্পিউটার বিজ্ঞান ও প্রকৌশল = Computer Science and Engineering
- ইলেকট্রিক্যাল ও ইলেকট্রনিক প্রকৌশল = Electrical and Electronic Engineering
- পরিবেশ বিজ্ঞান ও প্রকৌশল = Environmental Science and Engineering
- পরিসংখ্যান = Statistics
- অর্থনীতি = Economics
- লোক প্রশাসন ও সুশাসন অধ্যয়ন = Public Administration and Governance Studies
- লোকসাহিত্য = Folklore
- নৃবিজ্ঞান = Anthropology
- জনসংখ্যা বিজ্ঞান = Population Science
- স্থানীয় সরকার ও নগর উন্নয়ন = Local Government and Urban Development
- সমাজবিজ্ঞান = Sociology
- হিসাববিজ্ঞান ও তথ্য ব্যবস্থা = Accounting and Information Systems
- ফিন্যান্স ও ব্যাংকিং = Finance and Banking
- মানব সম্পদ ব্যবস্থাপনা = Human Resource Management
- ব্যবস্থাপনা = Management
- বিপণন = Marketing
- আইন ও বিচার = Law and Justice
- প্রশাসন = Administration

SESSION FORMAT CONVERSION:
- ২০২০-২১ → 2020-21
- ২০২১-২২ → 2021-22
- ৪র্থ বর্ষ → 4th year
- ৩য় বর্ষ → 3rd year
- ২য় বর্ষ → 2nd year
- ১ম বর্ষ → 1st year

Available categories: Academic, Admission, Examination, Result, Events, Workshop, Seminar, Conference, Cultural, Sports, Emergency, Holiday, Transportation, Scholarship, Job, Internship, Research, Administrative, General, Health, Safety, Accommodation, Library, IT, Other

Available priorities: Low, Normal, High, Urgent

Available types: Announcement, Circular, Notice, Alert, Reminder

Available roles: student, teacher, admin, all

Available departments: 
// Faculty of Arts and Humanities
Bangla Language and Literature, English Language and Literature, Music, Theatre and Performance Studies, Film and Media Studies, Philosophy, History, Fine Arts,

// Faculty of Science and Engineering  
Computer Science and Engineering, Electrical and Electronic Engineering, Environmental Science and Engineering, Statistics,

// Faculty of Social Sciences
Economics, Public Administration and Governance Studies, Folklore, Anthropology, Population Science, Local Government and Urban Development, Sociology,

// Faculty of Business Studies
Accounting and Information Systems, Finance and Banking, Human Resource Management, Management, Marketing,

// Faculty of Law
Law and Justice,

// Other
Administration, Other, all

Based on the content provided, generate a complete notice structure with:
1. Appropriate title (max 200 chars) - enhance if provided, generate if missing
2. Detailed content (max 5000 chars) - enhance the provided content, preserve Bangla if original
3. Summary (max 500 chars) - enhance if provided, generate if missing
4. Correct category from the list - use provided or suggest appropriate
5. Appropriate priority level - use provided or suggest appropriate
6. Suitable type - use provided or suggest appropriate
7. Targeting information - EXTRACT from images if applicable, PRESERVE all provided targeting data
8. Tags and keywords for searchability - enhance and add relevant ones
9. External links if mentioned - preserve provided links
10. Delivery settings if applicable - preserve provided settings

IMPORTANT: If targeting data is provided in the input, you must preserve ALL provided values including:
- sessions (if provided, keep exactly as given) - convert Bangla sessions to English format
- bloodGroups (if provided, keep exactly as given)
- roles, departments, gender, etc. (preserve all provided values)
- Extract targeting data from images when no user data is provided

TARGETING RULES:
- If user specifies specific departments, use ONLY those departments (do not add "all")
- If user specifies specific roles, use ONLY those roles (do not add "all")  
- If user specifies specific sessions, use ONLY those sessions
- Only use "all" when no specific targeting is provided by user or extracted from content
- When extracting from images/PDFs, be specific - avoid "all" if specific targeting is found

Input data:
${textData.title ? `Title: ${textData.title}` : ''}
${textData.content ? `Content: ${textData.content}` : ''}
${textData.category ? `Category: ${textData.category}` : ''}
${textData.priority ? `Priority: ${textData.priority}` : ''}
${textData.type ? `Type: ${textData.type}` : ''}
${textData.targeting ? `Targeting (PRESERVE ALL VALUES): ${JSON.stringify(textData.targeting, null, 2)}` : ''}
${textData.deliverySettings ? `Delivery Settings (PRESERVE): ${JSON.stringify(textData.deliverySettings, null, 2)}` : ''}
${textData.tags ? `Tags: ${JSON.stringify(textData.tags)}` : ''}
${textData.keywords ? `Keywords: ${JSON.stringify(textData.keywords)}` : ''}
${textData.externalLinks ? `External Links (PRESERVE): ${JSON.stringify(textData.externalLinks, null, 2)}` : ''}
${textData.summary ? `Summary: ${textData.summary}` : ''}

Full input data for reference:
${JSON.stringify(textData, null, 2)}

REMEMBER: 
1. Extract targeting information from Bangla images when possible
2. Convert Bangla department names and sessions to English equivalents
3. Preserve user-provided targeting data exactly as given
4. If image contains targeting info and user didn't provide it, use the extracted data
5. Your job is to ENHANCE the content, not replace user-provided targeting data, settings, or links
6. NEVER mix "all" with specific values - if specific departments/roles are provided, use ONLY those
7. Be precise with targeting - avoid defaulting to "all" when specific information is available

Return ONLY a valid JSON object in this exact format:
{
  "title": "string",
  "content": "string", 
  "summary": "string",
  "category": "string",
  "priority": "string",
  "type": "string",
  "targeting": {
    "roles": ["string"],
    "departments": ["string"],
    "bloodGroups": ["string"],
    "residenceKeywords": ["string"],
    "volunteersOnly": false,
    "sessions": ["string"],
    "gender": "string",
    "specificUsers": [],
    "excludeUsers": []
  },
  "deliverySettings": {
    "isImmediate": true,
    "sendEmail": false,
    "sendPushNotification": false,
    "expiresAt": null
  },
  "tags": ["string"],
  "keywords": ["string"],
  "externalLinks": [
    {
      "title": "string",
      "url": "string", 
      "description": "string"
    }
  ]
}
`;

    parts.push({ text: prompt });
    
    // Process uploaded files
    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = path.join(__dirname, '..', 'uploads', 'notice-attachments', file.filename);
        
        if (fs.existsSync(filePath)) {
          const mimeType = file.mimetype;
          
          if (mimeType.startsWith('image/')) {
            // Handle image files
            const imageData = fs.readFileSync(filePath);
            parts.push({
              inlineData: {
                data: imageData.toString('base64'),
                mimeType: mimeType
              }
            });
            parts.push({ 
              text: `\nAnalyze this image and extract any relevant information for the notice. Pay special attention to:
              
BANGLA TEXT EXTRACTION:
- Extract any Bangla/Bengali text and provide English translation
- Look for department names in Bangla and map to English equivalents
- Extract session information 
- Identify target audience (ছাত্র/ছাত্রী → students, শিক্ষক → teachers)
- Find blood group requirements if mentioned
- Extract dates, times, and venue information
              
TARGETING INFORMATION TO EXTRACT:
- Department/Faculty information (in Bangla or English)
- Session/Year information (১ম বর্ষ, ২য় বর্ষ, etc.)
- Student categories or specific groups
- Blood group requirements for donation drives
- Gender specifications if any
- Any restrictions or eligibility criteria
              
Include any text, dates, events, or important details found in the image.` 
            });
            
          } else if (mimeType === 'application/pdf') {
            // Handle PDF files - send directly to Gemini
            const pdfData = fs.readFileSync(filePath);
            parts.push({
              inlineData: {
                data: pdfData.toString('base64'),
                mimeType: mimeType
              }
            });
            parts.push({ 
              text: `\nAnalyze this PDF document and extract any relevant information for the notice. Pay special attention to:

PDF TEXT EXTRACTION:
- Extract all text content from the PDF document
- Look for Bangla/Bengali text and provide English translation where needed
- Extract department names in Bangla and map to English equivalents
- Extract session information (২০২০-২১ → 2020-21)
- Identify target audience (ছাত্র/ছাত্রী → students, শিক্ষক → teachers)

TARGETING INFORMATION TO EXTRACT FROM PDF:
- Department/Faculty information (in Bangla or English)
- Session/Year information (১ম বর্ষ, ২য় বর্ষ, etc.)
- Student categories or specific groups mentioned
- Blood group requirements for donation drives
- Gender specifications if any
- Eligibility criteria or restrictions
- Dates, times, and venue information
- Contact information or links

CONTENT STRUCTURE TO EXTRACT:
- Main title/heading of the document
- Important announcements or notices
- Event details (date, time, location)
- Requirements or instructions
- Deadlines or important dates
- Any forms or registration processes mentioned

Include all relevant text, dates, events, requirements, and important details found in the PDF document.` 
            });
          }
        }
      }
    }
    
    // Generate content with Gemini
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let parsedData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback to basic structure if parsing fails
      parsedData = {
        title: textData.title || 'Notice Title',
        content: textData.content || 'Notice content processed by AI',
        summary: textData.summary || 'AI-processed notice summary',
        category: textData.category || 'General',
        priority: textData.priority || 'Normal',
        type: 'Notice',
        targeting: {
          roles: ['all'],
          departments: ['all'],
          bloodGroups: [],
          residenceKeywords: [],
          volunteersOnly: false,
          sessions: [],
          gender: 'all',
          specificUsers: [],
          excludeUsers: []
        },
        deliverySettings: {
          isImmediate: true,
          sendEmail: false,
          sendPushNotification: false,
          expiresAt: null
        },
        tags: [],
        keywords: [],
        externalLinks: []
      };
    }
    
    // Validate and sanitize the parsed data
    parsedData = validateAndSanitizeNoticeData(parsedData, textData);
    
    return parsedData;
    
  } catch (error) {
    console.error('Gemini processing error:', error);
    throw new Error(`Failed to process content with Gemini AI: ${error.message}`);
  }
}

/**
 * Validate and sanitize the notice data from Gemini
 * @param {Object} data - Raw data from Gemini
 * @param {Object} originalData - Original user input data for preservation
 * @returns {Object} - Validated and sanitized data
 */
function validateAndSanitizeNoticeData(data, originalData = {}) {
  const validCategories = [
    'Academic', 'Admission', 'Examination', 'Result', 'Events', 
    'Workshop', 'Seminar', 'Conference', 'Cultural', 'Sports',
    'Emergency', 'Holiday', 'Transportation', 'Scholarship',
    'Job', 'Internship', 'Research', 'Administrative', 'General',
    'Health', 'Safety', 'Accommodation', 'Library', 'IT', 'Other'
  ];
  
  const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
  const validTypes = ['Announcement', 'Circular', 'Notice', 'Alert', 'Reminder'];
  const validRoles = ['student', 'teacher', 'admin', 'all'];
  const validDepartments = [
    // Faculty of Arts and Humanities
    'Bangla Language and Literature',
    'English Language and Literature',
    'Music',
    'Theatre and Performance Studies',
    'Film and Media Studies',
    'Philosophy',
    'History',
    'Fine Arts',
    
    // Faculty of Science and Engineering
    'Computer Science and Engineering',
    'Electrical and Electronic Engineering',
    'Environmental Science and Engineering',
    'Statistics',
    
    // Faculty of Social Sciences
    'Economics',
    'Public Administration and Governance Studies',
    'Folklore',
    'Anthropology',
    'Population Science',
    'Local Government and Urban Development',
    'Sociology',
    
    // Faculty of Business Studies
    'Accounting and Information Systems',
    'Finance and Banking',
    'Human Resource Management',
    'Management',
    'Marketing',
    
    // Faculty of Law
    'Law and Justice',
    
    // Other
    'Administration',
    'Other',
    'all'
  ];

  // All departments except 'all' for when no specific department is provided
  const allSpecificDepartments = [
    // Faculty of Arts and Humanities
    'Bangla Language and Literature',
    'English Language and Literature',
    'Music',
    'Theatre and Performance Studies',
    'Film and Media Studies',
    'Philosophy',
    'History',
    'Fine Arts',
    
    // Faculty of Science and Engineering
    'Computer Science and Engineering',
    'Electrical and Electronic Engineering',
    'Environmental Science and Engineering',
    'Statistics',
    
    // Faculty of Social Sciences
    'Economics',
    'Public Administration and Governance Studies',
    'Folklore',
    'Anthropology',
    'Population Science',
    'Local Government and Urban Development',
    'Sociology',
    
    // Faculty of Business Studies
    'Accounting and Information Systems',
    'Finance and Banking',
    'Human Resource Management',
    'Management',
    'Marketing',
    
    // Faculty of Law
    'Law and Justice',
    
    // Other
    'Administration',
    'Other'
  ];

  // Preserve original targeting data if provided
  const originalTargeting = originalData.targeting || {};
  const aiTargeting = data.targeting || {};

  return {
    title: (data.title || originalData.title || 'Notice Title').substring(0, 200),
    content: (data.content || originalData.content || 'Notice content').substring(0, 5000),
    summary: (data.summary || originalData.summary || '').substring(0, 500),
    category: validCategories.includes(data.category || originalData.category) ? 
      (data.category || originalData.category) : 'General',
    priority: validPriorities.includes(data.priority || originalData.priority) ? 
      (data.priority || originalData.priority) : 'Normal',
    type: validTypes.includes(data.type || originalData.type) ? 
      (data.type || originalData.type) : 'Notice',
    targeting: {
      // Preserve original roles or use AI suggestion, filter for validity
      roles: Array.isArray(originalTargeting.roles) && originalTargeting.roles.length > 0 ?
        originalTargeting.roles.filter(r => validRoles.includes(r)) :
        (Array.isArray(aiTargeting.roles) && aiTargeting.roles.length > 0 ? 
          aiTargeting.roles.filter(r => validRoles.includes(r)) : ['all']),
      
      // Preserve original departments or use AI suggestion
      departments: Array.isArray(originalTargeting.departments) && originalTargeting.departments.length > 0 ?
        originalTargeting.departments.filter(d => validDepartments.includes(d)) :
        (Array.isArray(aiTargeting.departments) && aiTargeting.departments.length > 0 ? 
          aiTargeting.departments.filter(d => validDepartments.includes(d)) : allSpecificDepartments),
      
      // Always preserve original bloodGroups if provided
      bloodGroups: Array.isArray(originalTargeting.bloodGroups) ?
        originalTargeting.bloodGroups : 
        (Array.isArray(aiTargeting.bloodGroups) ? aiTargeting.bloodGroups : []),
      
      // Always preserve original residenceKeywords if provided  
      residenceKeywords: Array.isArray(originalTargeting.residenceKeywords) ?
        originalTargeting.residenceKeywords :
        (Array.isArray(aiTargeting.residenceKeywords) ? aiTargeting.residenceKeywords : []),
      
      // Preserve original volunteersOnly setting
      volunteersOnly: originalTargeting.hasOwnProperty('volunteersOnly') ?
        Boolean(originalTargeting.volunteersOnly) :
        Boolean(aiTargeting.volunteersOnly),
      
      // Always preserve original sessions if provided
      sessions: Array.isArray(originalTargeting.sessions) ?
        originalTargeting.sessions :
        (Array.isArray(aiTargeting.sessions) ? aiTargeting.sessions : []),
      
      // Preserve original gender setting
      gender: ['male', 'female', 'all'].includes(originalTargeting.gender) ?
        originalTargeting.gender :
        (['male', 'female', 'all'].includes(aiTargeting.gender) ? aiTargeting.gender : 'all'),
      
      // Always preserve original specificUsers
      specificUsers: Array.isArray(originalTargeting.specificUsers) ?
        originalTargeting.specificUsers :
        (Array.isArray(aiTargeting.specificUsers) ? aiTargeting.specificUsers : []),
      
      // Always preserve original excludeUsers
      excludeUsers: Array.isArray(originalTargeting.excludeUsers) ?
        originalTargeting.excludeUsers :
        (Array.isArray(aiTargeting.excludeUsers) ? aiTargeting.excludeUsers : [])
    },
    deliverySettings: {
      // Preserve original delivery settings if provided
      publishAt: originalData.deliverySettings?.publishAt || data.deliverySettings?.publishAt || null,
      expiresAt: originalData.deliverySettings?.expiresAt || data.deliverySettings?.expiresAt || null,
      isImmediate: originalData.deliverySettings?.hasOwnProperty('isImmediate') ?
        originalData.deliverySettings.isImmediate :
        (data.deliverySettings?.isImmediate !== false),
      sendEmail: originalData.deliverySettings?.hasOwnProperty('sendEmail') ?
        Boolean(originalData.deliverySettings.sendEmail) :
        Boolean(data.deliverySettings?.sendEmail),
      sendPushNotification: originalData.deliverySettings?.hasOwnProperty('sendPushNotification') ?
        Boolean(originalData.deliverySettings.sendPushNotification) :
        Boolean(data.deliverySettings?.sendPushNotification)
    },
    // Merge original tags with AI suggestions
    tags: Array.isArray(originalData.tags) && originalData.tags.length > 0 ?
      [...new Set([...originalData.tags, ...(Array.isArray(data.tags) ? data.tags : [])])].slice(0, 10) :
      (Array.isArray(data.tags) ? data.tags.slice(0, 10) : []),
    
    // Merge original keywords with AI suggestions  
    keywords: Array.isArray(originalData.keywords) && originalData.keywords.length > 0 ?
      [...new Set([...originalData.keywords, ...(Array.isArray(data.keywords) ? data.keywords : [])])].slice(0, 15) :
      (Array.isArray(data.keywords) ? data.keywords.slice(0, 15) : []),
    
    // Preserve original external links or use AI suggestions
    externalLinks: Array.isArray(originalData.externalLinks) && originalData.externalLinks.length > 0 ?
      originalData.externalLinks.slice(0, 5).map(link => ({
        title: (link.title || '').substring(0, 100),
        url: (link.url || '').substring(0, 500),
        description: (link.description || '').substring(0, 200)
      })) :
      (Array.isArray(data.externalLinks) ? 
        data.externalLinks.slice(0, 5).map(link => ({
          title: (link.title || '').substring(0, 100),
          url: (link.url || '').substring(0, 500),
          description: (link.description || '').substring(0, 200)
        })) : [])
  };
}

module.exports = {
  processNoticeWithGemini
};
