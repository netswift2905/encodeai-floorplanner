# Kondo AI

## Project Summary   
A floorplanning app that seamlessly transforms real products to scale. Kondo AI leverages GPT Vision to create an AI companion for personalised reviews and ratings, and gamifies the overall user experience.

## Running Locally

### 1. Clone your newly created repo:

```
git clone {{your-repo-name}}
```

### 2. Enter your newly created repo's directory:

```
cd {{your-repo-name}}
```

### 3. Install dependencies:
For yarn:

```bash
yarn install
```

### 4. Start the development server:

For yarn:

```bash
yarn run dev
```

### 5. Visit `http://localhost:3000` in your browser to see the running app.
------
## Project Overview
### Problem Statement  
The current home design process is cumbersome and stressful, relying on outdated methods like tape measures and imagination. This leads to potential costly mistakes in furniture selection. Consumers seek a reliable and efficient solution for home planning but are deterred by the tedious and time-consuming nature of existing floor planning software. We are here to provide a solution.

### Our Solution Implementation
Kondo AI is a Next.js application, rendered on the frontend using HTML, Typescript, Javascript, CSS and IMGs. The backend is powered by Supabase.

We have designed web scraping algorithms that reliably find key product content (photos, price, colour, dimensions). LLMs then enhance and structure the scraped content into a JSON object, which becomes translated into an precisely scaled and moveable furniture item within the user's floor plan. These form building blocks the user can utilise to plan their layouts accurately, with real, to-scale products. Screenshots of their floor plans can be sent to GPT for item suggestions, layout review and budgeting advice. 

### Demo Images
![Demo4](https://github.com/netswift2905/encodeai-floorplanner/assets/80419704/f0f4ee0c-0b22-4a6b-8253-985b46631a5f)
![kondoAI](https://github.com/netswift2905/encodeai-floorplanner/assets/80419704/05cf0d18-deb3-4e61-bd14-d00932317de1)
![Demo1](https://github.com/netswift2905/encodeai-floorplanner/assets/80419704/b1b2c117-59dc-4b95-8eac-110139b75e35)
