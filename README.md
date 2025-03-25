# Contact Management Application

A robust, offline-capable contact management system built with Next.js and Airtable.

## User Persona: Sarah, the Relationship Manager

Sarah is a 42-year-old relationship manager at a mid-sized consulting firm. She manages relationships with over 100 clients and potential leads. Sarah needs to:

- Keep track of personal details about her contacts to build rapport
- Record when she last communicated with each person
- Access contact information quickly, even when traveling with spotty internet
- Organize contacts by category and status
- Get reminders about contacts she hasn't reached out to in a while

Sarah is moderately tech-savvy but doesn't have time to learn complex systems. She needs a solution that's intuitive, reliable, and works everywhere.

## How This Application Helps

This contact management system solves Sarah's challenges by providing:

1. **Comprehensive Contact Profiles**: Store not just basic information but personal details like birthdays, family information, and communication preferences.

2. **Communication Tracking**: Log every interaction with contacts and easily see when someone was last contacted.

3. **Offline Capability**: Continue working even without internet access, with changes automatically syncing when connection is restored.

4. **Organized Contact Management**: Filter and categorize contacts by multiple criteria to quickly find the right person.

5. **Notification System**: Get automatic reminders about contacts who haven't been reached out to in 30+ days.

## Key Features

### Contact Management
- Add, edit, and delete contacts with detailed profiles
- Store personal information including birthdays, family details, and preferences
- Categorize contacts with customizable statuses and categories
- Track contact history and last contacted dates

### Communication Logging
- Record different types of communications (calls, emails, in-person meetings)
- Add detailed notes for each interaction
- Track communication dates and frequency

### Offline-First Design
- Continue working without internet connection
- Local storage of all changes made while offline
- Automatic detection of connectivity status
- Manual and automatic syncing when connection is restored

### User Experience
- Responsive design that works on desktop and mobile
- Intuitive interface with minimal learning curve
- Dashboard with key statistics and insights
- Pagination for managing large contact lists
- Quick filters and search functionality

### Security
- Password protection for accessing the application
- Environment variable configuration for API endpoints
- Secure data storage using Airtable as a backend

## Technical Implementation

### Frontend
- Built with Next.js (App Router) and React
- TypeScript for type safety
- Tailwind CSS and shadcn/ui for styling
- Context API for state management

### Backend
- Airtable integration for data storage
- Next.js API routes for server-side operations
- Environment variable configuration

### Offline Functionality
- Browser localStorage for offline data persistence
- Change tracking system for syncing
- Conflict resolution for simultaneous changes

## Setup and Deployment

### Environment Variables
The application requires the following environment variables:
