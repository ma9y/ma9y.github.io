---
title: ma9y
layout: base
---
{% set posts = collections.micro %}

{% for post in posts %}
    <a href="{{ post.url }}">
      {{ post.data.date | date("DDD") }}
    </a>
      {{ post.content | safe }}
{% endfor %}





