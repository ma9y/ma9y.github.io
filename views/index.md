---
title: ma9y
layout: base
---
{% set posts = collections.micro %}

{% for post in posts | reverse %}
    <div class="pb-4">
    <a href="{{ post.url }}" class="font-semibold">
      {{ post.data.date | date("DDD") }}
    </a>
      {{ post.content | safe }}
    </div>
{% endfor %}





