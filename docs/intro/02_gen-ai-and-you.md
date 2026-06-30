# CPSC 210: GenAI and You

*Last updated: 2026W1* 


It is 2026 and you are starting a Software Construction course. In software engineering research and practice, it is nearly impossible to ignore the presence of pre-trained large language models (LLMs) for generating code. In between March and May 2026, the Communications of the ACM---a top venue for dissemination of ideas across all fields of Computer Science research--published numerous articles that expect, or take for granted, that LLMs will do most of the programming in the future. Articles emphasize that low-level programming skills will no longer dominate software engineering jobs [1]; that we must build towards AI agents being trusted collaborators [2]; that "AI Orchestrator" is a new role in data management jobs [3].

And yet, the words "agent", "GenAI", "LLM", or "prompt" appear nowhere in the introduction to your Software Construction course book. Why? 

We have thought carefully on how to allow and integrate GenAI into CPSC 210. Why have we chosen to allow is usage on the project and labs, but not in in-class exercises or the exams?

## Learning is about Process
 
We will not be asking you to code a function that turns a numerical grade into a letter grade because we need such a function. We can write one ourselves, or get GenAI to write it. No, we ask you to do such coding tasks so that you have the opportunity to *translate your ideas into code*, *encounter errors for yourself*, . This process is what we care about---not the outputted code.

Asking GenAI to write code for you because the assignment asks for code is confusing process and outcomes. We don't ask you to do homework because we need the solutions---we know them already. Those outcomes are not important. What is important is that in the process of reading and writing code by yourself, you gain code fluency.

You can use Google Translate to correspond with someone in another human language. That's fine if you care just about the outcome of _communicating in this conversation_. But this will be *much slower* at teaching you that human language than if you put in the (ugh, difficult!) effort of _manually_ writing or saying your thoughts in that language. 

"Is it the outcome or the process that matters to me?" is a good question to ask yourself when you're considering GenAI usage.

## Full Abstinence is Not Realistic 

From anecdotal reports from students and social media, it appears that many students are using GenAI---particularly chatbot interfaces---to study and complete assignments. Altogether banning its use seems futile. Also, unrealistic: we don't abstain from GenAI use ourselves.


<details class="tooltip deep-dive">
<summary>
How do we use GenAI?
</summary>

One of the authors of the reader used GenAI to create these nicely formatted tooltips. In terms of tooling, simple: just the automated GenAI google search uses, and Gemini's chat interface for more details. The workflow looked a bit like this:

- Use Google's result to get the HTML tags for the first tooltip box. Include this HTML, with embedded CSS, directly into the page.
- Write the first page of the reader.
- Add new tooltip boxes by copying the first tooltip box, and changing the colours/icons as needed.
- Decide to change one of the icons/colours. Realize I am doing a lot of copy-paste. Desire to reduce the copy-paste by introducing abstraction. Remember that CSS might enable this abstraction, but forget how to do this.
- Enter the Gemini chat interface and ask it how to create custom CSS so the embedded CSS need not be directly embedded in the reader.
- Look at the offered CSS. Realize it doesn't have the icons included in the offered CSS, and that I would still have to copy-paste things. Ask it to include these.
- Look at the offered CSS again. It seems to do what I want, but I noticed Gemini changed things I didn't want (such as colours), and the CSS seemed to have unnecessary fields in each element (fields I wasn't modifying with my embedded CSS). So I open a CSS file in vim, and copy-paste only the fields I think are necessary.
- Look at the result. It seems to work. Small query to the AI on how to add spacing between the badges. It offers multiple things. I try them manually, one seems to work best. I do that and call it a day.
- The next day, look at the website on mobile. Realize the tooltip formatting doesn't work with dark mode---some text is rendered in light font on light background. Realize now why the AI manually set the colour of the text within the tooltip.
- Google how to adjust CSS for light/dark mode. Google's GenAI offers three methods.
- I am skeptical these methods work because they mention using the users' or the browsers' settings, but our webpage has a manual light/dark button. I nevertheless try the first approach offered (the `light-dark` function). It doesn't work.
- I know we are using vitepress to create pages (I have no experience with vitepress, another reader creator set it up). So I google the same thing with the vitepress keyword.
- Google's GenAI mentions that with vitepress it is the .dark element that must be altered. It gives an example of how to override this for only specific CSS elements. With the little CSS I know, I adapt this to one of the tooltip types. It works.
- Satisfied, I commit this change without fully changing all the tooltips, wanting to go back to it later.
- Later, I go back and apply the change to all tooltip types. I document the CSS and push the changes to the book's `main` branch on GitHub.   

</details>

Furthermore, while we don't know exactly what GenAI will look like 4 years from now, we think it is likely it will play *some* part in software development. Thus, we want to allow students who are interested to explore the use of GenAI in the project to be able to. In doing so, they will form their own opinions of how they want to use it. 

On the other hand, we do not want to force students uninterested in GenAI to use it. The open-endedness of the project makes it an excellent place to allow its use without creating equity issues.

As for labs---well, we'd really recommend you do the labs without AI. Your first exposure to material will be in lecture exercises. We think your labs are early-enough exposure that it will still be beneficial to your learning to try (and fail!) to do them on your own.    

## Full Adoption May Hamper Learning Outcomes

"Do students still need to learn to write code themselves, or can they become effective programmers without code?" 

This question is being discussed amongst faculty in computers science broadly. Part of the question depends on what the definition of "programmers" means. We are on the lookout for evidence of the effect of AI-based completion on learning.

So far, the evidence we've seen suggests that, _on average_, using AI-based completion of writing and code can hamper learning outcomes. 
 
 
(Not yet peer-reviewed) Researchers at MIT studied brain activity when participants wrote an essay with and without AI. They actually had 3 treatments: no external resources, allowed to Google things, and allowed to use an LLM to write text. The participants that used an LLM to write text spent a lot of their time reading the LLM-written text and copying and pasting it. (This is similar to what we've observed in students and colleagues using LLMs to write code: there may be a perception of productivity because the LLM writes a lot of code, but time shifts to reading possibly huge amounts of LLM-generated code... which can be harder than just writing the code themselves.) Brain activation varied per each group---as not a brain experts, we're not sure what to conclude from that. Interestingly, LLM users struggled to quote their own essays: no participant was able to provide correct quotes of "their" essays. When it comes to learning, the paper states:
> If users rely heavily on AI tools, they may achieve superficial
fluency but fail to internalize the knowledge or feel a sense of ownership over it.

Our goal in this course is to increase your code fluency, your self-efficacy around programming tasks (less "I could _never_ do this without _<Insert AI Tool>_!"), your self-efficacy around learning new programming languages and frameworks. This findinding suggests heavy reliance around AI tools won't get you there.  
https://arxiv.org/pdf/2506.08872

 
(Not yet peer-reviewed) Researchers at Anthropic, the company that provides Claude Code, an agentic coding tool, conducted a study where they asked engineers to complete a coding task with and without AI. The coding task included learning a framework that was unfamiliar to them. What they find is interesting. Using AI leads to a non-significant speedup on time to code the solution (a p-value of 0.391 means that their statistical modeling implies a 39% chance the observed value was just random), from 25 minutes to 23 minutes. But it leads to a significant reduction in quiz score (p-value of 0.010; 1% chance the observed difference is due to randomness), from 65% to 50%. The quiz included questions about error propagation in the framework being used, and about asynchronous programming more generally. A really interesting finding that's a little buried: the task time _was_ significantly faster for novice developers (1-3 years of coding experience), around 22m vs 33m. But it was _not_ significantly faster for experienced (4-6 years) and advanced (7+ years) developers, with task times staying between 22-25 minutes regardless of AI use. Our takeaway from this study: on constrained coding tasks, like the one in the study, and the ones in labs and exercise in this class, AI will make you faster---for now. Once you gain more experience, it won't benefit you very much. And it will almost definitely reduce the understanding you gain from doing the task. (A few participants who used AI still did well on the quiz, but they took time to consider their own understanding of what was going on, and write out this understanding to the AI, rather than asking the AI to explain).
https://www.anthropic.com/research/AI-assistance-coding-skills 


(Peer-reviewed) https://dl.acm.org/doi/pdf/10.1145/3632620.3671116

JetBrains created a video on this paper: https://www.youtube.com/watch?v=HTUh0OO6Kmo

> our findings show an unfortunate divide in the use of
GenAI tools between students who did and did not struggle. Some
students who did not struggle were able to use GenAI to accelerate, creating code they already intended to make, and were able to
ignore unhelpful or incorrect inline code suggestions. But for students who struggled, our findings indicate that previously known
metacognitive difficulties persist, and that GenAI unfortunately can
compound them and even introduce new metacognitive difficulties.
Furthermore, struggling students often expressed cognitive dissonance about their problem solving ability, thought they performed
better than they did, and finished with an illusion of competence


(Peer-reviewed) https://dl.acm.org/doi/pdf/10.1145/3657604.3662046
This paper covers both AI-based and traditional plagiarism (i.e., finding code solutions and submitting them as your own). In a way, the problems of AI are not new. Whether you're asking ChatGPT to provide an answer, or copy-and-pasting a code solution from somewhere else with zero thought, you're giving up on your opportunity to practice. It does appear that students plagiarized more after the emerge of ChatGPT
> Through manual review of the flagged solutions obtained above,
we identified four binary features that are potentially indicative
of plagiarism: advanced syntax, extra comment, extra print, and
extra code. Answers that demonstrate each of these markers can
be found in Table 1.
> 
> Advanced Syntax marker: The advanced syntax marker is present
if there is any appearance of list/set/dictionary comprehensions,
generator expressions, map, reduce, or lambda
>
> Extra Comment marker: The extra comment marker is present if
there is any appearance of comments. [...] As an introductory CS course for non-majors, the course neither
emphasizes documentation of code nor penalizes students for a
lack of documentation
> 
> Extra Print marker: The extra print marker is present if there is any
print statement in a question that does not require print to receive
full credit [...]
> 
> Extra Code marker: The extra code marker is present if there is any
code that is outside the scope of the function that the question is
asking the students to write, except import ... [students are encouraged to test, but not to submit their tests for grading]

> The key output of the regression is the coefficient 𝛾 (plotted in
Figure 6), which relates learning loss to the degree of observed
plagiarism. In both semesters, this parameter is statistically significantly positive. The Fall 2022 data suggests that a student observed
to plagiarize every assignment would perform 47 percentage points
lower than they would if they had not cheated. Spring 2023 data
suggests the drop would only be 36 percentage points. Because we
usually detect plagiarism on only a fraction of a student’s submissions (see Figure 3), the observed learning losses are smaller than
these numbers would suggest.


We know that some students will continue to use GenAI even knowing it harms their learning outcomes. Just like some students continue to cheat. Think carefully about the opportunities being at UBC provides you. We will be happy, in class and in office hours, to spend time with you discussing things you don't understand, and hopefully helping you reach an understanding! We will be best able to help you reach an understanding if you've attempted the assignment yourself _up to the point you get stuck_. As educators, we use the understanding of where you got stuck to make our engagement with you more relevant to the hurdle you currently face. As the class continues, you'll clear those hurdles, and maybe meet other ones. You can use AI to run a race parallel to the hurdles, and get the solution to the problem sets. But the literature suggests that parallel race won't help you overcome the hurdles. 

## Low-Level "Optimal" GenAI Use Evolves Rapidly

What we won't teach you in this class _at all_ is "Optimal" GenAI usage. What do we mean by this? We mean tips to use GenAI that are _incredibly particular_ to the models and interaction modes of GenAI that are currently in vogue. This includes tips on prompt engineering---persona setting, giving some examples, suggesting to turn off sycophancy---and tips on, say, coordinating agent usage.

We're not teaching you these low-level details because the details are evolving in sync with rapidly evolving GenAI models and usage. Since OpenAI introduced the original Codex model for coding in August 2021, we've seen LLMs move through various modalities:

- early on, [Codex](https://en.wikipedia.org/wiki/OpenAI_Codex_(language_model)) was pitched as a code-completion model. There was no ChatGPT or personification of the model. We would have taught you to interact with this model by suggesting you write detailed comments in your source code, and get the model to do line completion from there.
- we might have suggested you do [few-shot prompting](https://en.wikipedia.org/wiki/Prompt_engineering#Multi-shot), rather than zero-shot prompting. That is, giving the LLM a few examples of the of answers to questions like the one you want to ask, rather than simply asking the question.
- we might have later suggested that not only do you give examples of answers, but give examples that _spell out the intermediate step_ of the answers, in ["chain-of-thought"](https://en.wikipedia.org/wiki/Prompt_engineering#Multi-shot] prompting)
- when ChatGPT became generally available, the "chat" interface led to personification of the LLM. When the LLM was a viewed as a code completion model, it made little sense to say "please" or other niceties in the prompt. Once it was viewed as a "chat", we saw the emergence of persona-setting ("you are an expert sofware engineer..."), and other prompting techniques that treat the LLM as something close to a person. 
- As nearly all data on the internet has been trained on, it is possible more weight has been put on RLHF. The [RLHF](https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback) part of LLM's training appears to be making LLMs [sycophantic](https://en.wikipedia.org/wiki/Sycophancy_(artificial_intelligence)). The "HF" stands for Human Feedback, and the LLMs are rewarded for answers that humans give better feedback on. This turns out to incentivize sycophantic behaviour: agreeing with the human prompter, praising the human prompter, etc.  This gets dangerous: it is difficult to trust a "yes" from the LLM if the question was worded in a way where the human would have wanted agreement. Further, praise is easy for the LLM to spit out, but also meaningless: the LLM is spitting out because it's been trained that humans _like_ such praise, not because it "thinks" the prompt is deserving of such praise.
   - From the paper [Towards Understanding Sycophancy in Large Language Models](https://proceedings.iclr.cc/paper_files/paper/2024/hash/0105f7972202c1d4fb817da9f21a9663-Abstract-Conference.html): 
   
> We find that when a response matches a user's views, it is more likely to be preferred. Moreover, both humans and preference models (PMs) __prefer convincingly-written sycophantic responses over correct ones__ [emphasis added] a non-negligible fraction of the time. 

- [agents](https://proceedings.neurips.cc/paper_files/paper/2023/hash/1b44b878bb782e6954cd888628510e90-Abstract-Conference.html) first emerged as LLMs that were augmented with the ability to use tools, i.e. that could invoke a compiler or get information via a few specific websites. Here the concerns start to move from prompting to the tools an agent has access to. **Danger:** if one of the tools an agent has access to is unconstrainted file editing, it is possible it can entirely remove files on your filesystem. If using agents, make sure you are aware of the _permissions_ it has, and follow the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) when giving it permissions.  
- as context windows (the amount of text you can feed the LLM, and the amount of text it can give you back) grew, precisely prompting and giving only the least information is no longer necessary: just give the model all the context. Scientists [found in 2024](https://aclanthology.org/2024.tacl-1.9.pdf) that LLMs don't necessarily handle large contexts well: they still perform better when information is at the start or the end of the context. 
- companies offering agents, such as Anthropic, are now advocating the "[loops](https://code.claude.com/docs/en/agent-sdk/agent-loop)" way of interacting with the agent: the agent not only has access to tools, but re-prompts itself without human intervention. These loops are necessarily building up huge amounts of context (though, agents generally have a tool to compress this context).


At the same time as GenAI seems to be evolving to a place where GenAI tools need less and less human feedback, we are seeing costs emerge. Less and less human feedback, and in particular AI agent "loops", mean that more AI compute is being used. In summer 2026, several companies were documented as over-spending on tokens: notably, an unnamed company spending $500 million on Anthropic model usage; Uber now putting a $1,500/month spend cap on each employee's AI usage [4]. When Anthropic announced a price hike to its model services in May 2026 that more accurately reflected model costs, users were suprised to see how quickly these costs went up [5].

It is not clear to us where industry will land on quantity and mode of AI usage. We have decided we don't want to teach you to code in any way that _depends_ on access to a particular quantity or mode of AI usage. We think building up your code fluency will make you better able to evaluate and question LLM responses (in the presence of LLM sycophancy, you must rely on your _own judgements_ of correctness). And we think the software construction skills you will learn, which are inherently abstraction and decomposition skills, will come to be useful to you in using GenAI effectively. 

## High-Level Use of GenAI Requires Problem Solving

From our personal experience using GenAI and observing our colleagues using GenAI, we are convinced that beyond the low-level issues above, using GenAI effectively involves:

1. the ability to decompose problems into components that, together, will solve the problem
2. the ability to assess whether a code solution is adequate in terms of functionality, performance, and extensibility
3. the ability to understand technical language that appears in LLM outputs, and use this technical language to refine future LLM outputs

We believe the software construction skills you'll learn in this class will help with all these abilities. Points 1. and 2. are classic software construction skills. As for Point 3., we've chosen to make the book vocabulary-heavy, and, when possible, link this to vocabulary you've learned in prior classes, to build your confidence. Knowing that vocabulary, won't be bamboozled when AI output includes technical language: they'll be able to evaluate whether the language is correct, plausible but needing verification, or nonsensical.

These ablities are the hard work. We believe they are the abilities that will make you stand out as an AI-assisted engineer. Picking up on the AI interaction strategies that will be relevant will be easy by comparison.


## Equity

As of the time of this writing, it is widely believed that Claude Code is one of the best coding agents out there. Accessing it requires paying a monthly fee, which not all students can afford. Thus, for parts of the class that are heavily graded on the correctness of code following a certain spec---notably, the exams---we want to ensure students with access to "better" models don't have an unfair advantage. (TODO: how are labs graded)

The design of the exams and the grading of the course, in our opinion, should overall discencentivize AI use. Giving up on learning opportunities we provide to you throughout the course



[1] https://cacm.acm.org/blogcacm/the-return-of-soft-skills-in-the-age-of-genai-and-agentic-software-development/

[2] https://cacm.acm.org/opinion/agentic-ai-software-engineers-programming-with-trust/

[3] https://cacm.acm.org/opinion/orchestrating-the-schema/

[4] https://financialpost.com/technology/companies-burning-through-ai-tokens-racking-up-bills

[5] https://arstechnica.com/ai/2026/06/ai-costs-how-much-github-copilot-users-react-to-new-usage-based-pricing-system/

[6] https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/






# OLD outline

I think I want to make 3 points:

- there is hype about AI replacing all of SE. We have thought about it, and our conclusion is that the best way to prepare you to work with AI is to provide you solid foundational knowledge of code.
- There are 3 reasons for this:
	- our own experience seeing our junior and senior colleagues use AI (crista lopes)
	- AI-specific tooling is changing rapidly; it's unclear what technology you'll have access to in the future, and teaching in a way that's dependent on this technology  
	- papers
- we don't know whether AI will totally replace human coding, much like a hairstylist will use a calculator rather than do math in their head to decide how many abrasive chemicals to put on a clients' head, or wolframalpha for differential calculus. We currently think it is unlikely it will fully replace human coding, but. However, the experiences above make us strongly believe that becoming code fluent is the best way to position you as a value-add over AI. 
	


# OLD TEXT: won't make any sense

*Preface: It is unusual to have a page like this in a course reader: it describes course policy, not course content. But in discussions with other department members, and computer science educators across the world, the topic of GenAI involvement in our curriculum is constant. We have for months discussed what our GenAI policy should be, and how we should express this policy to our students. In the end, we feel that having a page that fully discusses the __why__ of our GenAI policy is valuable to our students, and so, it is here. We may move this page from the reader to course materials if we change our minds.*

And yet, nowhere in the introduction to your Software Construction courses

The low-level skills of programming will no longer dominate software engineering jobs;
https://cacm.acm.org/blogcacm/the-return-of-soft-skills-in-the-age-of-genai-and-agentic-software-development/

building towards a goal of AI agents being trusted collaborators


emphasizing that AI has "tremendous potential"
https://cacm.acm.org/careers/teaching-programmers-a-survival-mindset/

stating that AI will reduce demand for junior engineers, and we must work strategically to ensure we do not lose all our talent.
https://cacm.acm.org/opinion/redefining-the-software-engineering-profession-for-ai/

the emergence of the "AI Orchestrator" role. 
[3] https://cacm.acm.org/opinion/orchestrating-the-schema/

<details class="tooltip deep-dive">
<summary>
What is Gen AI?
</summary>
By "Gen AI", we mean "Generative AI". Here we are using it as particular shorthand to include large language models offered by various industrial actors, as well as open-source 
</details>

The first page of your Software Construction course reader does not mention the word "GenAI", "LLM", "agent", or "prompt". What gives? Are its writers ostriches?


GenAI
https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/

> The comments follow reports that the firm had already burnt through its entire 2026 AI coding tools budget in just four months after incentivizing employees to adopt the technology through an internal leaderboard ranking teams by total AI tool usage. 

> Uber isn’t the only company facing this issue. Microsoft earlier this month reportedly began canceling most of its direct Claude Code licenses, according to The Verge, instead moving engineers toward using GitHub Copilot CLI. A number of other business leaders have walked back their initial bullish AI views. Duolingo CEO Luis von Ahn last year reversed his outlook on AI, saying he doesn’t see the tech replacing the tasks his employees perform.

https://financialpost.com/technology/companies-burning-through-ai-tokens-racking-up-bills

> In a now-viral example, one company reportedly spent US$500 million in one month on Claude licences from Anthropic PBC, according to the Axios news site. Other companies are withholding employee raises as a result of their unexpected AI spending or saying that human employees are now cheaper to hire than deploying AI.
> Some execs are attempting to rein in costs by setting AI usage limits. For example, Uber Technologies Inc. has implemented a monthly cap of US$1,500 in AI token spending per coding tool.
>


<details class="tooltip deep-dive">
<summary>
Ostriches?
</summary>
Mention of us being ostriches is a joke referencing the English-language idiom "to bury ones head in the sand". This idiom means, roughly, "to willfully ignore very obvious things". It is related to ostriches in that it was believed ostriches [would bury their heads in the sand](https://en.wikipedia.org/wiki/Common_ostrich#Head_in_sand) when afraid. Apparently, this is a myth. 
</details>

We have thought carefully on how to allow and integrate GenAI into CPSC 210. From anecdotal reports from students and social media, it appears that many students are using GenAI---particularly chatbot interfaces---to study and complete assignments. Altogether banning its use seems futile. Also, unrealistic: we don't abstain from GenAI use ourselves. 

After all, in the past, we did not ban using a search engine or answers from Stack Overflow. 


Our goal in CPSC 210 is to teach you evergreen skills. Skills that will assist you in problem solving regardless of the extent you use AI. We have found in our use of AI that we apply software engineering practice in our use.

As an example of how things have changed rapidly. In 2024, agents were not in vogue. If we had wanted to teach you to in an AI-centric way, we may have tried to suggest prompt engineering methods (persona setting, etc.). By 2026, discourse is all about agents: those prompt engineering methods are less relevant, instead the questions may be about sandboxing the agents and stuff. But already by the writing of this article, we are seeing pushback that agents are simply too expensive. If we taught this course in a way that would depend on use of agents, could you work in a position where the company has decided agents are too expensive?

What is the evergreen concept in all this? Problem decomposition. Being able to quickly understand what code does. Knowing what needs to be tested --- either in an exploratory or programatic fashion

## About Your Learning Experience 

A particularly
https://www.anthropic.com/research/AI-assistance-coding-skills
https://arxiv.org/abs/2506.08872

