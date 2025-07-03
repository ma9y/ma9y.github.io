---
title: běžecký log
layout: activities
---
{% set posts = collections.post %}

{% for post in posts %}

<a href="{{ post.url }}">{{ post.data.title }}</a>

{% endfor %}



