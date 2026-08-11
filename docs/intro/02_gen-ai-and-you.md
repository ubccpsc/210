# CPSC 210: GenAI and You

*Last updated: 2026W1* 


It is 2026 and you are starting a Software Construction course. In software engineering research and practice, it is nearly impossible to ignore the presence of pre-trained large language models (LLMs) for generating code. In between March and May 2026, the Communications of the ACM---a top venue for dissemination of ideas across all fields of Computer Science research--published numerous articles that expect, or take for granted, that LLMs will do most of the programming in the future. Articles emphasize that low-level programming skills will no longer dominate software engineering jobs [1]; that we must build towards AI agents being trusted collaborators [2]; that "AI Orchestrator" is a new role in data management jobs [3].

And yet, past these introductory chapters, the words "agent", "GenAI", "LLM", and "prompt" appear nowhere in the chapters that teach you software construction. Why? 

We have thought carefully about how to allow and integrate GenAI into CPSC 210. Why have we chosen to allow its usage on the project and labs, but not in in-class exercises or the exams?

## Summary: Learning is about Process
 
We will not be asking you to code a function that turns a numerical grade into a letter grade because we need such a function. We can write one ourselves, or get GenAI to write it. No, we ask you to do such coding tasks so that you have the opportunity to *translate your ideas into code*, *encounter errors for yourself*, and *work out how to resolve them*. This process is what we care about---not the outputted code.

Asking GenAI to write code for you because the assignment asks for code is confusing process with outcomes. We don't ask you to do homework because we need the solutions---we know them already. Those outcomes are not important. What is important is that in the process of reading and writing code by yourself, you gain _code fluency_: the ability to read, write, and judge code for yourself.

You can use Google Translate to correspond with someone in another human language. That's fine if you care just about the outcome of _communicating in this conversation_. But this will be *much slower* at teaching you that human language than if you put in the _difficult_ effort of _manually_ writing or saying your thoughts in that language. 

"Is it the outcome or the process that matters to me?" is a good question to ask yourself when you're considering GenAI usage.

## Full Abstinence is Not Realistic 

From anecdotal reports from students and social media, it appears that many students are using GenAI---particularly chatbot interfaces---to study and complete assignments. Altogether banning its use seems futile. Also, unrealistic: we don't abstain from GenAI use ourselves.


<details class="tooltip deep-dive">
<summary>
How do we use GenAI?
</summary>

One of the authors of the textbook used GenAI to create these nicely formatted tooltips. In terms of tooling, simple: just the automated GenAI Google search results, and Gemini's chat interface for more details. The workflow looked a bit like this:

- Use Google's result to get the HTML tags for the first tooltip box. Include this HTML, with embedded CSS, directly into the page.
- Write the first page of the textbook.
- Add new tooltip boxes by copying the first tooltip box, and changing the colours/icons as needed.
- Decide to change one of the icons/colours. Realize I am doing a lot of copy-paste. Desire to reduce the copy-paste by introducing abstraction. Remember that CSS might enable this abstraction, but forget how to do this.
- Enter the Gemini chat interface and ask it how to create custom CSS so the embedded CSS need not be directly embedded in the textbook.
- Look at the offered CSS. Realize it doesn't have the icons included in the offered CSS, and that I would still have to copy-paste things. Ask it to include these.
- Look at the offered CSS again. It seems to do what I want, but I noticed Gemini changed things I didn't want (such as colours), and the CSS seemed to have unnecessary fields in each element (fields I wasn't modifying with my embedded CSS). So I open a CSS file in vim, and copy-paste only the fields I think are necessary.
- Look at the result. It seems to work. Small query to the AI on how to add spacing between the badges. It offers multiple things. I try them manually, one seems to work best. I do that and call it a day.
- The next day, look at the website on mobile. Realize the tooltip formatting doesn't work with dark mode---some text is rendered in light font on light background. Realize now why the AI manually set the colour of the text within the tooltip.
- Google how to adjust CSS for light/dark mode. Google's GenAI offers three methods.
- I am skeptical these methods work because they mention using the users' or the browsers' settings, but our webpage has a manual light/dark button. I nevertheless try the first approach offered (the `light-dark` function). It doesn't work.
- I know we are using vitepress to create pages (I have no experience with vitepress; another textbook author set it up). So I google the same thing with the vitepress keyword.
- Google's GenAI mentions that with vitepress it is the .dark element that must be altered. It gives an example of how to override this for only specific CSS elements. With the little CSS I know, I adapt this to one of the tooltip types. It works.
- Satisfied, I commit this change without fully changing all the tooltips, wanting to go back to it later.
- Later, I go back and apply the change to all tooltip types. I document the CSS and push the changes to the textbook's `main` branch on GitHub.   

</details>

Furthermore, while we don't know exactly what GenAI will look like 4 years from now, we think it is likely it will play *some* part in software development. Thus, we want students who are interested in exploring the use of GenAI in the project to be able to do so. In doing so, they will form their own opinions of how they want to use it. 

On the other hand, we do not want to force students uninterested in GenAI to use it. The open-endedness of the project makes it a reasonable place to allow its use without creating equity issues.

As for labs---well, we'd really recommend you do the labs without AI. Your first exposure to material will be in lecture exercises. We think your labs are early-enough exposure that it will still be beneficial to your learning to try (and fail!) to do them on your own.    

## Full Adoption May Hamper Learning Outcomes


*If you want a TL;DR*, [JetBrains Academy made a video](https://www.youtube.com/watch?v=HTUh0OO6Kmo) mostly focused on the fourth paper we discuss (the "widening gap" study). Note that JetBrains is a company that develops IDEs. Anthropic, a company that develops GenAI tools, has [a blog post](https://www.anthropic.com/research/AI-assistance-coding-skills) on the third paper we discuss here (its own study of skill formation).

 
The main way in which LLMs harm learning is not new. Whether you're asking ChatGPT to provide an answer, or copy-and-pasting a code solution from somewhere else with zero thought, you're giving up on your opportunity to practice. Educators provide you with practice exercises not because they need another solution to the practice exercises, but because they think you will _learn_ through practice. 
The paper [_Plagiarism in the Age of Generative AI: Cheating Method Change and Learning Loss in an Intro to CS Course_](https://dl.acm.org/doi/pdf/10.1145/3657604.3662046), from researchers at the University of Illinois Urbana-Champaign, attempts to measure the negative consequences of students skipping practice. The paper covers both LLM-based and traditional cheating (i.e., finding code solutions and submitting them as your own). The researchers manually analyze proven and likely plagiarised solutions, and develop features that allow them to estimate a student's _plagiarism ratio_: the proportion of a student's assignments that were likely plagiarised (either copying LLM code or code from solutions banks online). From this, they can then look at whether this plagiarism ratio is related to a student's performance on the final exam, controlling for their performance on the first exam. Their results suggest that if a student were to (likely) plagiarize every assignment between the first and final exam, their performance on the final exam would drop by _36%_, in a setting where ChatGPT was available. They also find that likely plagiarism became more common after the emergence of ChatGPT.

When it comes to using LLMs in a more interactive manner, however, the automation provided by LLMs appears to alter outcomes differently than the automation provided by search engines.  In [_Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task_](https://arxiv.org/pdf/2506.08872) (not yet peer-reviewed), researchers at MIT study brain activity when participants wrote an essay with and without AI. They have 3 treatments: no external resources ("brain-only"), allowed to use search engines, and allowed to use an LLM to write text. The participants that used an LLM to write text spent a lot of their time reading the LLM-written text and copying and pasting it. (This is similar to what we've observed in students using LLMs to write code for course projects: time shifts to reading and trying to verify possibly huge amounts of LLM-generated code... which can be harder than just writing the code.) Brain activation varied per each group: as we are not brain science experts, we're not sure what to conclude from that. Interestingly, LLM users struggled to quote their own essays: no participant was able to provide correct quotes of "their" essays. When it comes to learning, the paper states:
> If users rely heavily on AI tools, they may achieve superficial fluency but fail to internalize the knowledge or feel a sense of ownership over it.

Our goal in this course is to increase your code fluency, your self-efficacy around programming tasks (less "I could _never_ do this without _[Insert AI Tool]_!"), and your self-efficacy around learning new programming languages and frameworks. This finding suggests heavy reliance on LLM tools is less likely to get you there.  


 
In [_How AI Impacts Skill Formation_](https://arxiv.org/abs/2601.20245) (not peer-reviewed) researchers at Anthropic---the company that provides Claude Code, an agentic coding tool---asked developers to complete a coding task with and without LLM tool use. The coding task included learning a framework that was unfamiliar to them. What they find is interesting. Using the LLM tool leads to a _non-significant_ speedup on time to code the solution, from 25 minutes to 23 minutes (p-value of 0.391: a difference this size would arise by chance about 39% of the time even if the tool made no difference). But it leads to a _significant_ reduction in quiz score, from 65% to 50% (p-value of 0.010: such a difference would arise by chance only about 1% of the time). The quiz included questions about error propagation in the framework being used, and about asynchronous programming more generally. An interesting finding that's a little buried in this study: the task time _was_ significantly faster for novice developers (1-3 years of coding experience), from 33 minutes down to 22 minutes. But it was _not_ significantly faster for experienced (4-6 years) and advanced (7+ years) developers, whose average task times were between 22-25 minutes regardless of LLM use. Our takeaway from this study: on constrained coding tasks, like the one in the study, and the ones in labs and exercises in this class, LLMs will make you faster, for now. Once you gain more experience, LLMs won't benefit you very much on those tasks . However, LLM use will almost definitely reduce the understanding you gain from doing the task. That said, a few participants who used LLMs still did well on the quiz. These were participants who took time to consider their own understanding of what was going on, and wrote out this understanding to the LLMs, rather than asking the LLMs to explain.

What's interesting about the Anthropic study is they separate out a coding task and an understanding task. The UIUC study (first one) looked at grades on the programming parts of exams. It may make sense to you that, yeah, the students who use LLMs to code will struggle without LLMs to code. But does it matter? Can't the students learn the concepts behind coding by prompting LLMs to code? The Anthropic study suggests the answer to this question is: no. 


Which leads us to [_The Widening Gap: The Benefits and Harms of Generative AI for Novice Programmers_](https://dl.acm.org/doi/pdf/10.1145/3632620.3671116), a study by researchers at institutions across the USA and Europe. In this study, the researchers observed students in a first programming course as they attempted to solve a programming problem. The students were allowed to use both Copilot (a code-completion-based LLM tool) and ChatGPT (a chat interface, not inherently aware of the code being written). The researchers found mixed results of these LLM-based tools: for a few students, the LLM-based tools accelerated their performance, but for many others, the LLM-based tools interfered with their performance. The split between these groups? The presence of _metacognitive_ difficulties. Meta-cognition is thinking about thinking; for example, noticing that when you're faced with a certain type of programming problem, you get nervous. Meta-cognitive skills won't necessarily mean you won't get nervous, but they might allow you to take a step back from your current (nervous) thoughts, and think back to the design recipe steps. Another problem: students who had metacognitive difficulties and used LLMs didn't accurately recognize how they used the LLMs. For example, they might state they only use the LLM to confirm their solution, but it was clear from their interactions that the solution came from the LLM in the first place. The researchers found that Copilot, the code-completion based LLM, introduced a whole new metacognitive difficulty: its suggestions would interrupt the students' trains of thought.

In this study, the students who succeeded in using LLMs to accelerate their performance showed one ability the students who struggled had trouble with: they were able to quickly determine _when the LLM was wrong_. To be able to quickly determine whether LLM-generated code is wrong, you need to be able to process that code's meaning clearly. This is a core part of the _code fluency_ we aim to form in this course. 

## Low-Level "Optimal" GenAI Use Evolves Rapidly

What we won't teach you in this class is "optimal" GenAI usage. What do we mean by this? We mean tips to use GenAI that are _incredibly particular_ to the models and interaction modes of GenAI that are currently in vogue. This includes tips on prompt engineering (persona setting, giving some examples, suggesting to turn off sycophancy) and tips on, say, coordinating agent usage.

One reason we're not teaching you these low-level details is because the details are evolving in sync with rapidly evolving GenAI models and usage. Since OpenAI introduced the original Codex model for coding in August 2021, we've seen LLMs move through various modalities. Here's a chain of different things we could consider teaching, and when they became (ir)relevant:

- Early on, [Codex](https://en.wikipedia.org/wiki/OpenAI_Codex_(language_model)) was pitched as a code-completion model. There was no ChatGPT or personification of the model. We would have taught you to interact with this model by suggesting you write detailed comments in your source code, and get the model to do line completion from there.
- We might have suggested you do [few-shot prompting](https://en.wikipedia.org/wiki/Prompt_engineering#Multi-shot), rather than zero-shot prompting. That is, giving the LLM a few examples of answers to questions like the one you want to ask, rather than simply asking the question.
- Later we might have suggested that not only do you give examples of answers, but give examples that _spell out the intermediate steps_ of the answers, in ["chain-of-thought" prompting](https://en.wikipedia.org/wiki/Prompt_engineering#Chain-of-thought)
- When ChatGPT became generally available, the "chat" interface led to personification of the LLM. When the LLM was viewed as a code completion model, it made little sense to say "please" or other niceties in the prompt. Once it was viewed as a "chat", we saw the emergence of persona-setting ("you are an expert software engineer..."), and other prompting techniques that treat the LLM as something close to a person. 
- As nearly all data on the internet has been trained on, more improvements in LLM performance come from direct feedback (either from humans or other LLMs) to the LLM as to what outputs are "good". The [RLHF](https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback) part of LLM's training appears to be making LLMs [sycophantic](https://en.wikipedia.org/wiki/Sycophancy_(artificial_intelligence)). The "HF" stands for Human Feedback, and the LLMs are rewarded for answers that humans give better feedback on. This turns out to incentivize sycophantic behaviour: agreeing with the human prompter, praising the human prompter, etc.  This gets dangerous: it is difficult to trust a "yes" from the LLM if the question was worded in a way where the human would have wanted agreement. Further, praise is easy for the LLM to spit out, but also meaningless: the LLM is spitting it out because it's been trained that humans _like_ such praise, not because it "thinks" the prompt is deserving of such praise.
   - From the paper [Towards Understanding Sycophancy in Large Language Models](https://proceedings.iclr.cc/paper_files/paper/2024/hash/0105f7972202c1d4fb817da9f21a9663-Abstract-Conference.html): 
   
> We find that when a response matches a user's views, it is more likely to be preferred. Moreover, both humans and preference models (PMs) __prefer convincingly-written sycophantic responses over correct ones__ [emphasis added] a non-negligible fraction of the time. 

- [Agents](https://proceedings.neurips.cc/paper_files/paper/2023/hash/1b44b878bb782e6954cd888628510e90-Abstract-Conference.html) first emerged as LLMs that were augmented with the ability to use tools, i.e. that could invoke a compiler or get information via a few specific websites. Here the concerns start to move from prompting to the tools an agent has access to. _Danger:_ if one of the tools an agent has access to is unconstrained file editing, it is possible it can entirely remove files on your filesystem. If using an agent, make sure you are aware of the _permissions_ it has, and follow the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) when giving it permissions.  
- As context windows (the amount of text you can feed the LLM, and the amount of text it can give you back) grew, precise prompting that gives only the least information is no longer necessary: just give the model all the context. Scientists [found in 2024](https://aclanthology.org/2024.tacl-1.9.pdf) that LLMs don't necessarily handle large contexts well: they still perform better when information is at the start or the end of the context. 
- Companies offering agents, such as Anthropic, are now advocating the "[loops](https://code.claude.com/docs/en/agent-sdk/agent-loop)" way of interacting with the agent: the agent not only has access to tools, but re-prompts itself without human intervention. These loops are necessarily building up huge amounts of context (though agents generally have a tool to compress this context).


At the same time as GenAI seems to be evolving to a place where tools need less and less human feedback, we are seeing costs emerge. Less and less human feedback, and in particular AI agent "loops", mean that more AI compute is being used. In summer 2026, several companies were documented as over-spending on tokens: notably, an unnamed company spending $500 million on Anthropic model usage [4]; Uber now putting a $1,500/month spend cap on each employee's AI usage [6]. When Anthropic announced a price hike to its model services in May 2026 that more accurately reflected model costs, users were surprised to see how quickly these costs went up [5].

For a concrete example of how rapidly this "optimal use" evolves: in 2023, Microsoft launched [GenAIScript](https://microsoft.github.io/genaiscript/). The GitHub touts the tagline "Prompting is Coding", and Microsoft released [several](https://www.youtube.com/watch?v=ENunZe--7j0) [videos](https://www.youtube.com/watch?v=ajEbAm6kjI4) promoting the project, and researchers at Microsoft Research presented this project at a Pacific Northwest gathering of Programming Languages experts. This project aimed to help developers interact with LLMs through prompting, save and programmatize their prompts. In May 2026, the project was quietly sunsetted, archived on GitHub. (Amusingly, Gemini failed to notice that it was deprecated until one of us forced it to [go look at the GitHub](https://share.google/aimode/gS2W65sqEC2c75TIb) repo.) We don't know exactly why this is: the project had 35 contributors, 229 forks and 2.9k stars on GitHub, so it was not altogether unsuccessful. We think it's likely because industry is moving from prompt-completion-centred AI usage to agentic AI usage. That one of the leads on the GenAIScript project is now touted as creating [GitHub Agentic Workflows](https://github.github.com/gh-aw/) suggests this might be true. We would not feel good if we had focused on teaching you GenAIScript-prompt-centered coding two years ago, only for that whole toolchain to be deprecated.

The takeaway is: it is not clear to us where industry will land on _quantity_ and _mode_ of AI usage.  So, we have decided we don't want to teach you to code in any way that _depends_ on access to a particular quantity or mode of AI usage. We think building up your code fluency will make you better able to _evaluate_ and _question_ LLM responses (in the presence of LLM sycophancy, you must rely on your _own judgements_ of correctness, just like how one of us had to tell the LLM to go look at GenAIScript's GitHub page). And we think the software construction skills you will learn, which are inherently _abstraction_ and decomposition skills, will come to be useful to you in using GenAI effectively, whatever that looks like in the future.

## High-Level Use of GenAI Requires Problem Solving

From our personal experience using GenAI and observing our colleagues using GenAI, we are convinced that beyond the low-level issues above, using GenAI effectively involves:

1. The ability to decompose problems into components that, together, will solve the problem; 
2. The ability to assess whether a code solution is adequate in terms of functionality, performance, and extensibility; and
3. The ability to understand technical language that appears in LLM outputs, and use this technical language to refine future LLM outputs.

We believe the software construction skills you'll learn in this class will help with all these abilities. Point 1 and Point 2 are classic software construction skills. As for Point 3, we've chosen to make the textbook vocabulary-heavy, and, when possible, link this to vocabulary you've learned in prior classes, to build your confidence. Knowing that vocabulary, you won't be bamboozled when AI output includes technical language: you'll be able to evaluate whether the language is correct, plausible but needing verification, or nonsensical.

These abilities are the hard work. We believe they are the abilities that will make you stand out as an AI-assisted engineer. Picking up on the AI interaction strategies that will be relevant will be easy by comparison.

## Conclusion

Think carefully about the opportunities being at UBC provides you. We will be happy, in class and in office hours, to spend time with you discussing things you don't understand, and hopefully helping you reach an understanding! We will be best able to help you reach an understanding if you've attempted the assignment yourself _up to the point you get stuck_. As educators, we use the understanding of where you got stuck to make our engagement with you more relevant to the hurdle you currently face. As the class continues, you'll clear those hurdles, and maybe meet other ones. Those hurdles won't feel like hurdles any more. But if you rely on GenAI tools to clear the hurdles for you, you will continue to need to rely on these tools.

[1] <https://cacm.acm.org/blogcacm/the-return-of-soft-skills-in-the-age-of-genai-and-agentic-software-development/>

[2] <https://cacm.acm.org/opinion/agentic-ai-software-engineers-programming-with-trust/>

[3] <https://cacm.acm.org/opinion/orchestrating-the-schema/>

[4] <https://financialpost.com/technology/companies-burning-through-ai-tokens-racking-up-bills>

[5] <https://arstechnica.com/ai/2026/06/ai-costs-how-much-github-copilot-users-react-to-new-usage-based-pricing-system/>

[6] <https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/>
