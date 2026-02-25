---
toc: content
group: 
  title: Frontend Engineering
  order: 1
order: 2
---
# Frontend Technology Selection

## Overview
Technology selection is a necessary stage when doing frontend architecture. Compared to project standards and coding standards, some standards of technology selection can be quantified.

For example: In the early stage of mobile internet, jQuery was dominant. When various technical teams developed mobile sites, most used zepto.js to replace jQuery. Because the functions and APIs of both are very similar, migration cost is low. But zepto.js has a smaller volume and relatively better performance in poor network environments. This is a quantifiable standard: functionality and performance. (Of course, both are now obsolete, this is just an example)

You can also use some tools for preliminary analysis to obtain related indicators, such as:
- npms-analyzer evaluates the comprehensive performance of an open source framework/tool from 4 perspectives: quality, maintenance frequency, popularity, and author, which has certain guiding significance for projects without historical baggage or complete refactoring.
- BundlePhobia: Analyze package size
- GitHub Insights: View project activity

Generally, we can make selections from the following 7 directions:
- Functionality
- Performance
- Stability
- Ecosystem
- Learning curve
- Author
- Community

## Common Technology Selection Indicators
### Functionality
Functionality is a basic indicator. If functionality cannot be met, it's directly eliminated. Functionality should not only see if it can meet current product needs, but also meet foreseeable new needs from product development.
For example, if future products may be cross-platform, then consider comparisons of solutions like React Native/Flutter/Taro.
If it can be satisfied, we also need to consider the specific implementation mode of functionality and API simplicity.
If two frameworks have similar implementation modes, but one has simpler, more readable APIs and implements the same functionality in a relatively elegant way, it's necessarily a relatively better choice.
If two frameworks have different implementation methods, choose the one more in line with future development, such as the choice between Vite and Webpack.
SPA and micro-frontend architecture: Products don't need SEO, but as products develop, business modules will become increasingly large. Then consider micro-frontend architecture.
If SEO is needed, then consider server-side rendering. SPA architecture is not suitable.

### Performance
If the project is mobile-first, such as e-commerce websites, we need to consider, first, responsive layout, and second, ultimate performance.
Even considering only websites, good user experience is indispensable. So the performance of a framework/tool itself is crucial.
Besides loading speed, we also need to consider computing power, response speed, virtual DOM efficiency, and framework rendering optimization strategies and other runtime performance.

### Stability
Losses caused by logic problems or security incidents due to bugs in third-party frameworks/tools are huge. So stability is an important indicator for basic technology selection.
We can judge whether a framework is stable from the number of Issues and resolution speed. Even after choosing a relatively stable framework, we still need to remain vigilant.
We can also choose appropriate versions from version iteration strategies, such as versions with LTS tags, suitable for enterprise-level projects.

### Ecosystem
A framework/tool's ecosystem can be divided into two parts: one is extension plugins or frameworks that combine with it to form a complete system, such as Redux for React, Vuex for Vue;
The other is the richness of development and debugging tools, such as IDE syntax highlighting plugins, browser debug tools, and scaffolding.
One targets application architecture, the other targets engineering systems.

### Learning Curve
This is about human "emotional" factors. A relatively gentle learning curve allows teams to accept and understand faster.
For example, React's learning curve is obviously steeper than Vue's, especially when frontend documentation is incomplete. Vue's ability to rise suddenly is not only due to its own quality, but also due to simple APIs and friendly documentation.

### Author
Generally speaking, projects made by well-known companies or teams have higher quality than individual projects, and stability is more guaranteed.
React's popularity is not only due to eye-catching architectural patterns and technical reforms, but also Meta's strong background.

### Community
Community activity can reflect a project's popularity. In a large community, problems you encounter have a high probability of being solved by predecessors.

### Others
There are some other considerations, such as:
- Security: Whether there are XSS vulnerabilities, whether the dependency chain is secure.
- Compatibility: Browser support range, whether there are conflicts with other libraries.
- Open source license: This is not a decisive hard indicator, but also needs to be understood to avoid some legal risks.

## Summary
Technology selection is a key link in frontend architecture design, directly affecting long-term maintainability, team efficiency, and user experience. By combining quantitative indicators with qualitative analysis, we can more scientifically evaluate technical solutions.
Additionally, there's no silver bullet in technology selection. Regular review is needed to avoid "using for the sake of using."
