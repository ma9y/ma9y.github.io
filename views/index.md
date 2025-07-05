---
title: ma9y
layout: base
---
{% set posts = collections.micro %}

{% for post in posts %}
    <a href="{{ post.url }}" class="text-blue-600">
      {{ post.data.date | date("DDD") }}
    </a>
      {{ post.content | safe }}
{% endfor %}





