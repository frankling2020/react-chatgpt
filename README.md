<h1 align="center">
    React-ChatGPT
</h1>
<p align="center">
    <strong>Simple Full-Stack Summarizer based on ChatGPT</strong>
</p>

## Simple Summarizer
### Description
<p>
    It contains a React-based summarizer built with ChatGPT whose primary purpose of the application is to generate a summary of paragraphs with highlighting of the relevant keywords. It aims to facilitate the comprehension of the original text and to enhance user trust in the generated summary.
</p>
<p>
    <b>Tools</b>: <em>Docker, OpenAI, ReactJS, Flask (gunicorn + gevent), Celery (Redis)</em>
</p>

---

#### Why Tools?
- **Docker**: Docker is widely used for deploying web applications. Many cloud providers, such as AWS, Google Cloud, and Azure, have native support and integration with Docker, making it easier to deploy and manage containerized applications in their environments. Besides, Docker has a more mature set of tooling and orchestration solutions, such as Docker Compose, Docker Swarm, and integrations with Kubernetes. These tools simplify the management and scaling of containerized applications.
- **ReactJS**: React is a popular choice for building modern web application frontends. React's component-based architecture promotes modularity, reusability, and encapsulation of UI elements. This makes it easier to build and maintain complex user interfaces by breaking them down into smaller, self-contained components.
- **Flask**: Flask is a lightweight and flexible Python web framework that is easy to learn and get started with.
- **Gunicorn**: Gunicorn (Green Unicorn) is a widely used Python WSGI HTTP server that is designed to handle multiple concurrent requests efficiently. Gunicorn supports various worker models, including asynchronous workers, which can improve the performance of Flask applications.
- **Gevent**: it will allow web application to scale to potentially thousands of concurrent requests on a single process. It mainly replaces blocking parts with compatible cooperative counterparts from gevent package by "monkey patching". It uses epoll or kqueue or libevent for highly scalable non-blocking I/O.
- **Celery**: Celery is a powerful and robust distributed task queue system that enables asynchronous task execution, scheduling, and distributed work processing. Celery supports distributing tasks across multiple workers, allowing applications to scale horizontally by adding more Celery workers as needed.
- **Redis**: Redis provides a fast, lightweight, and efficient message queue system, making it suitable for handling large volumes of tasks and ensuring reliable task delivery.
- **Nginx (TO-DO)**: NGINX is well known as a high‑performance load balancer, cache, and web server.

---


### Code Design and Explanation
<p>
    The source code for the summarizer can be found in the <em>src</em> folder, which contains all the primary implementation files. It contains the components including Form and Histogram in <em>src/components</em> and the main file <em>App.js</em>. The application leverages several techniques to achieve its objectives, including Jaccard similarity and a histogram of word length frequency, which respectively delineate the connection to the original text and comprehensibility.
</p>

#### Justification
- Jaccard similarity is widely used to compute the similarity of two set. In this case, I calculate it with respect to keywords.
- Word length frequency can somehow reflect the frequency of rare words and [one paper](https://arxiv.org/abs/2301.11305v1) also shows that there are some statistical patterns in machine-generated texts. 
    Word length may be one way to approach the ChatGPT detection. It will be meaningful to visualize the distribution.   

#### <strong>Basic rules</strong> are:
- If the Jaccard similarity is lower than 0.7, you may doubt the results.
- If the length of most words are shorter, then it will be easy to read.

<p>
    For the web interface part, the public folder contains some basic information.
</p>
<div align="center">
    <img src="examples/2.png" style="width:75%">
</div>


### Deployment
<p>Please see the deployment of pure ReactJS <a href="https://frankling2020.github.io/react-chatgpt/">here</a>. You can see the original code in the other branch. </p> 
<p>This repository contains the code for Docker deployment with Flask, ReactJS, Celery, and Gunicorn.</p>

---

### Development
#### Frontend: ReactJS
You can follow the steps below one-by-one
- `npm install`: first install the dependencies for the project.
- `npm run start`: see your version of the application after you change some codes.
- `npm run deploy`: deploy the application after checking [this link](https://facebook.github.io/create-react-app/docs/deployment).

#### Backend: Flask + Gunicorn
You should also run the Flask backend at the same time which is held at localhost:5000. You can start it by running either of the following commands.
- `python3 server.py`
- `gunicorn server:app -c ./gunicorn.conf.py` (preferred)

You may want to take a deep look at the configuration file `backend/gunicorn.conf.py` to adapt to your environment.


#### Broker: Celery + Redis
You can start the broker to make the web appliaction more scalable with the command
- `celery -A celery_task worker --loglevel=info`

The detailed configuration is under `backend/celeryconfig.py`


#### Development with Dokcer
Docker is a good tool to deploy applications in different platforms. Here you can see we have `Dockerfile` in both `frontend/` and `backend/` folders and `docker-compose.yaml` in the directory. So, you can directly use the command `docker-compose -d up` with `docker` installed in your computer. I would recommend you to use Docker Desktop which can inspect the containers with GUI shown below.

<div align="center">
    <img src="examples/docker-impl.png" style="width:70%">
</div>

The following figure shows the success deployment and some console log for your debegging in the web inspection mode.
<div align="center">
    <img src="examples/inspection.png" style="width:90%">
</div>


### Usage
<p>
    It is designed to be user-friendly and easily accessible to users with different technical backgrounds. To use the application, users may first follow the <a href="https://platform.openai.com/account/api-keys">link</a> on the first page to fetch their OpenAI API key which will be memorized before pressing the reset button, and paste the text to the form. After submitting the form, the original text will be rendered on the left side of the window, people may read some when they are waiting for the results from ChatGPT. After receiving the ChatGPT response, the browser will directly highlight the keywords in the original text and summary and compute the Jaccard similarity with respect to the keywords' appearance in the original text and summary.
</p>
<p>
    For people who know nothing about Jaccard similarity, the basic rule is that the result with Jaccard similarity below 0.7 may include some extra/fabricated information.
</p>

<div align="center">
    <img src="examples/3.png" style="width:75%">
</div>

### Further Discussion
<p>
    Overall, this summarizer provides a simple, yet effective way to quickly comprehend a paper's content and ascertain the trustworthiness of the generated summary. It may be used to annotate some machine-generated text with fabricated information for natural language processing research. It is also fun for people to observe how the input text may influence the trustability of ChatGPT, namely whether ChatGPT adds extra/fabricated information to the summary. It also shows how ChatGPT will weigh context information over pre-acquired knowledge.
</p>
<div align="center">
    <img src="examples/1.png" style="width:75%">
</div>


### References
- [react-graph-gallery histogram](https://www.react-graph-gallery.com/histogram)
- [MDN react](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_components#defining_our_first_component)
- [Gunicorn with Flask](https://flask.palletsprojects.com/en/2.3.x/deploying/gunicorn/)
- [Flask with Celery](https://flask.palletsprojects.com/en/2.3.x/patterns/celery/)


## Getting Started with Create React App (Default React Documentation)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
