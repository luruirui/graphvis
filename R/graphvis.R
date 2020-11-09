#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export

# 安装htmlwidgets包
if (not 'htmlwidgets' %in% installed.packages()){
  install.package('htmlwidgets')
}

graphvis <- function(links, nodes, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    links = links,
    nodes = nodes
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'graphvis',
    x,
    width = width,
    height = height,
    package = 'graphvis',
    elementId = elementId
  )
}

#' Shiny bindings for graphvis
#'
#' Output and render functions for using graphvis within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a graphvis
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name graphvis-shiny
#'
#' @export
graphvisOutput <- function(outputId, width = '100%', height = '800px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'graphvis', width, height, package = 'graphvis')
}

#' @rdname graphvis-shiny
#' @export
renderGraphvis <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, graphvisOutput, env, quoted = TRUE)
}
