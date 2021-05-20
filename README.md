# Classroom Digital Twins with Instrumentation-Free Gaze Tracking

Demo Website: https://digitaltwin.edusense.io/

This is a repository for visualizing the complete 3D classroom given information about the instructor, students and the classroom static fixtures. It takes input the json files for the required data and generates a 3D view of the classroom in the browser. This also provides support for VR, just open the hosted website in the VR browser. To generate the json files, please use the the [EduSense Repo](https://github.com/edusense/edusense).

The code for 6 DOF gaze tracking is integrated in the [EduSense Repo](https://github.com/edusense/edusense).
More details can be found [here](https://www.edusense.io/digital-twins).

![digitaltwins](https://user-images.githubusercontent.com/10175885/118900374-ca3a4900-b8de-11eb-83cf-18b477973eb4.gif)

## How to run

To run the visualizer, just run the local server at the root folder. No other setup is required. Simplest way to do this is to run the following command and then go to localhost:8080 in the web browser. 

```sh
python -m http.server 8080
```

To access the website from anywhere, serve the entire folder as a static content. 

## Reference

Karan Ahuja, Deval Shah, Sujeath Pareddy, Franceska Xhakaj, Amy Ogan, Yuvraj Agarwal, and Chris Harrison. 2021. Classroom Digital Twins with Instrumentation-Free Gaze Tracking. In Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems (CHI '21). Association for Computing Machinery, New York, NY, USA, Article 484, 1–9. DOI:https://doi.org/10.1145/3411764.3445711

Download paper [here](https://karan-ahuja.com/assets/docs/paper/digitaltwin.pdf).

Bibtext Reference:
```
@inproceedings{10.1145/3411764.3445711,
author = {Ahuja, Karan and Shah, Deval and Pareddy, Sujeath and Xhakaj, Franceska and Ogan, Amy and Agarwal, Yuvraj and Harrison, Chris},
title = {Classroom Digital Twins with Instrumentation-Free Gaze Tracking},
year = {2021},
isbn = {9781450380966},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
url = {https://doi.org/10.1145/3411764.3445711},
doi = {10.1145/3411764.3445711},
articleno = {484},
numpages = {9},
keywords = {digital twins., Classroom sensing, gaze tracking},
location = {Yokohama, Japan},
series = {CHI '21}
}
```

