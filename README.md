# Welcome to Mush-ine learning


## Learn to identify edible mushrooms that grow in the UK

Live site: https://mushine-learning.vercel.app

Learning to identify mushrooms from books and websites is hard! Mush-ine learning is an online application designed to train users to identify canonical examples of edible mushroom species. 

Complete mushroom identification games to earn XP points and level up! Your results are used to build a model of your successes and failures which informs the options you are presented in games. The more levels you complete the better the app understands the mistakes you make and can recommend mushrooms to study. You can view this data yourself on the insights page and the study page.


</br>

## Motivation

My aim was to build a full stack application where I could utilise my skills that I use in my day job as a React and Typescript developer, but with the additional freedom to play and experiment with new technologies and approaches to development. 

My main motivation was to explore tRPC because I although I think GraphQl is great and very powerful, it brings a lot of complexity that can hinder a small-medium sized side project.

</br>

<p align="center"><img width="879" alt="Screenshot 2023-02-12 at 11 56 26" src="https://user-images.githubusercontent.com/78092825/218309586-462b5c6c-7810-4111-8103-a3ca6e5d183b.png">


</br>

It was important to me that users got a personalised experience and that the system would evolve based on the mistakes that the user made. To accomplish this I needed to implement authentication and tie training data to a specific user. This also opened up the possibility to show personalised insights.

<img width="879" alt="Screenshot 2023-02-12 at 11 53 06" src="https://user-images.githubusercontent.com/78092825/218309394-bbf77671-4d28-40b6-84e4-90d35be1ab7f.png">
<p>

I particularly enjoyed the developer experience of using Typescript and having tRPC as my layer between my frontend and the server, it ensured that anything crossing the client/server boundary was fully typed. Heres an example of using Zod syntax to declare input type for a client => server tRPC hook.

<p align="center"><img width="626" alt="Screenshot 2023-02-12 at 12 13 34" src="https://user-images.githubusercontent.com/78092825/218310399-6245060b-225f-458b-befe-4476b5712fc1.png"></p>

Deploying with Vercel and running on Github actions on pull requests has also been a nice experience

<p align="center"><img width="716" alt="Screenshot 2023-02-18 at 11 45 53" src="https://user-images.githubusercontent.com/78092825/219863922-1a3f9d0a-0a2e-4349-94ac-d322f3068e74.png"></p>



