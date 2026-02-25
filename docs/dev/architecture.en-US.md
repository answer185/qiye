---
toc: content
group: 
  title: Frontend Engineering
  order: 1
order: 1
---

# Frontend Architecture

## Overview
After project initiation, to ensure high availability, scalability, performance, and security of the project, we need to design the project architecture. Any architectural design implementation must be fundamentally based on the project's characteristics, otherwise it is meaningless. For example:
- For an international website, we need to add multi-language support.
- For a mobile-first website, we need to introduce responsive design.

Additionally, it should be noted that architectural design needs to balance short-term delivery with long-term maintenance costs. For example, in rapidly iterating startup projects, we might prioritize solutions with high development efficiency (like Vue) rather than over-engineering.

## Relationship Between Frontend Engineering and Frontend Architecture
Any project, regardless of scale, involves development, testing, release, and maintenance. These processes typically belong to the engineering domain. Each enterprise should have a standardized engineering plan for all projects. Frontend architecture, in addition to depending on the project's own complexity, is also influenced by business type, scenarios, platforms, user groups, and other characteristics. For example, the internationalization and mobile-first scenarios mentioned above.

Architectural design typically also affects frontend engineering, so we need to add frontend engineering solution adjustment steps in architectural design. This can be called the frontend engineering service step.

## Architecture Design Process
The typical architecture design process is as follows:
- Project type determination: Organize project runtime environment, business characteristics, user characteristics, etc.
- Architecture pattern selection (SPA/MPA/Micro-frontend/Cross-platform, etc.): Based on project type, initially determine the architecture pattern
- Technology stack selection: Based on team's technology stack and project complexity, determine which frontend technology stack to use (React/Vue/Angular)
- Core architecture design: Based on technology stack and business characteristics, design source code directory structure/state management/routing modularization/third-party dependencies, etc.
- Detailed architecture design: Based on business module splitting, determine source code directory rules, permissions, special scenario design, and other details.
- Engineering solution improvement: Based on the above technical architecture design, improve frontend engineering content.
- Architecture evolution: Continuously verify and improve architectural design during iterations.

## Architecture Design Details
### Project Type Determination
Every project initiation always has corresponding business scenarios. We should start from the project's scenarios, understand what problems it solves, how to solve them, what environment the project will ultimately run in, who the end users are, and how they use the project. Only after understanding these basic pieces of information can we design the architecture.

For example, a sales management system might have scenarios like:
- Enterprises want to manage sales personnel's outdoor behavior, ensure sales personnel reach terminal stores, complete inventory, and report shelf product conditions, order information, return information, and other tasks.
- Relevant departments of the enterprise react immediately based on reported situations.
- Management hopes to summarize corresponding data for daily morning meetings or enterprise decision-making.
- Enterprise office uses DingTalk or Feishu, hoping that reported data can directly integrate with daily office systems.

From the scenarios, we can conclude that the project should have at least a Web end and DingTalk or Feishu extension applications. Whether independent mobile apps or mini-programs are needed depends on other situations. For example:
- If enterprises want customers to customize reporting, mini-programs, independent Apps, or a mobile-first mall might be considered.
- If enterprises have their own Apps and want the business to integrate with the App, hybrid application development or adding corresponding functions to the App might be needed.

End users of the project might include:
- Enterprise sales personnel
- Enterprise after-sales personnel
- Enterprise management
- Terminal store customers

Their usage methods might be:
- Sales personnel mainly use mobile phones, confirm location after arriving at stores, and report corresponding data on mobile phones.
- After-sales personnel work in offices, mainly use computers, and perform order, return, and other information review and printing operations on the Web end.
- Management: Might use both mobile and Web ends, focusing on statistical data or exporting corresponding data for meetings.

These basic pieces of information can be improved through stakeholder interviews, user journey maps, and other methods.

### Architecture Pattern Selection
From an application perspective, common choices include:
- SPA architecture: Generally used for small and medium-sized applications that don't require SEO.
- Micro-frontend architecture: For complex large and medium-sized applications, micro-frontend can be considered for splitting to avoid monolithic applications.
  - Communication schemes between sub-applications (like Custom Events or state sharing) need to be clarified, and sandbox isolation (qiankun) and style conflicts (CSS Modules/Shadow DOM) need to be considered.
- Cross-platform architecture: If applications involve H5, mobile Apps, etc., with the same design and functionality, cross-platform choices need to be considered.
- Multi-page application architecture: Like malls, enterprise websites, and other sites that need SEO.
  - For such scenarios, whether to use frontend-backend separation needs to be considered first.
  - If frontend-backend separation is used, server-side rendering like Next.js can be considered.
  - If not separated, full-stack architecture using frameworks like Express, Koa, Egg.js, and Next.js can be used.
- Hybrid application architecture: Generally chosen when Apps or mini-programs need to embed H5.

### Technology Stack Selection
Currently, there are two main choices: building based on Vue and React. Of course, architectures like micro-frontend can also be used, with good isolation, using both.

Generally speaking, for projects with complex business and higher performance requirements, React and its ecosystem are recommended. For projects requiring rapid completion and easy team onboarding, Vue and its ecosystem are used.

For cross-platform, options include:
- React Native
- Flutter
- Uniapp
- Taro

Flutter is suitable for high-performance UI consistency scenarios, Taro is suitable for WeChat ecosystem, and learning costs and cross-platform coverage need to be weighed.

Additionally, scaffolding and language extension issues need to be considered, such as using umi or Next.js scaffolding. Language extensions are mainly JS and CSS extension solutions.

In summary, at this step, we need to set up the frontend technology framework.

### Core Architecture Design
At this step, based on the technology stack and project business characteristics, determine the following aspects:
- Routing: Based on which routing solution? Does it need to be converted to configuration? Do directory and file rules need to be determined for automatic loading? What do routing hook functions need to do? etc.
- State management: Based on which state management solution? Which are global data? Which are business data? What is the data flow like?
- Third-party libraries: Need to consider some common libraries, such as data processing, date processing, graphics and reports processing, cookie processing, etc.
- Directory structure: Generally designed by functional modules, page components, common components, hooks, utils, static resources, and services, which can also be understood as a modular design structure.

### Detailed Architecture Design
Design corresponding architecture based on specific business scenarios, such as:
- Mobile-first: Responsive design
- Internationalization: Multi-language design
- Extensibility: Plugin architecture
- Broadcast messages: Publish and subscribe architecture
- Offline scenarios: PWA
- Real-time and complex data calculation: WebAssembly
- Permissions: Permission control design from global to page buttons
- Security: Input validation solutions, content security policies, which content needs encryption, preventing cross-site attacks and sensitive data desensitization, etc.

### Frontend Engineering Improvement
Based on the above architectural design, we need to re-improve frontend engineering standards, building, deployment, monitoring, and statistics to better adapt to the current project situation.

Specific content includes:
Performance optimization design
The performance here mainly considers:
- Project startup speed
- Project build speed: Need to consider code splitting and persistent caching strategies
- Code splitting and lazy loading
- Runtime performance, such as:
  - For large data display, virtualization needs to be considered.
  - Image lazy loading
- Static resource CDN acceleration
- Source file compression: Code compression, enabling gzip

### Architecture Evolution
Continuously improve project architecture during project iterations. Optimization design can be done by recording specific problems, such as:
- Form performance degradation might be caused by controlled and uncontrolled components and debounce factors.
- Form duplicate submission might be due to issues with shared button loading and disable properties.
- Bundle size increase: Might be due to introducing a new library without lazy loading.
- Style mutual influence: Might be due to issues with micro-frontend style isolation solutions.

## Summary
In summary, frontend architectural design needs to be centered on project characteristics, revolving around business scenarios, user needs, and technical constraints. From project type determination to technology selection (SPA/Micro-frontend/Cross-platform), to core architecture (routing, state management) and detailed design (internationalization, permissions), each step needs to balance performance, scalability, and maintenance costs. Engineering solutions (building, deployment, monitoring) and continuous evolution are equally important. Good architecture should have foresight while leaving flexible space for iterations, ultimately achieving efficient, stable, and secure product delivery.
